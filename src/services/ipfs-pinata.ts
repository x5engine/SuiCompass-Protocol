/**
 * IPFS Pinata Service
 * Handles document uploads to IPFS via Pinata
 */

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || ''
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || ''
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

export interface PinataUploadResult {
  success: boolean
  ipfsHash?: string
  pinataUrl?: string
  error?: string
}

export class PinataService {
  /**
   * Upload file to IPFS via Pinata
   */
  async uploadFile(file: File, metadata?: Record<string, any>): Promise<PinataUploadResult> {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      return {
        success: false,
        error: 'Pinata API keys not configured. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY',
      }
    }

    try {
      // Prepare form data
      const formData = new FormData()
      formData.append('file', file)

      // Add metadata if provided
      if (metadata) {
        const pinataMetadata = {
          name: file.name,
          keyvalues: metadata,
        }
        formData.append('pinataMetadata', JSON.stringify(pinataMetadata))
      }

      // Add options
      const pinataOptions = {
        cidVersion: 1,
      }
      formData.append('pinataOptions', JSON.stringify(pinataOptions))

      // Upload to Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const ipfsHash = data.IpfsHash

      return {
        success: true,
        ipfsHash,
        pinataUrl: `${PINATA_GATEWAY}${ipfsHash}`,
      }
    } catch (error) {
      console.error('Pinata upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Upload JSON metadata to IPFS
   */
  async uploadJSON(data: Record<string, any>, name: string = 'metadata.json'): Promise<PinataUploadResult> {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      return {
        success: false,
        error: 'Pinata API keys not configured',
      }
    }

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
        body: JSON.stringify({
          pinataContent: data,
          pinataMetadata: {
            name,
          },
          pinataOptions: {
            cidVersion: 1,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `HTTP ${response.status}`)
      }

      const result = await response.json()
      const ipfsHash = result.IpfsHash

      return {
        success: true,
        ipfsHash,
        pinataUrl: `${PINATA_GATEWAY}${ipfsHash}`,
      }
    } catch (error) {
      console.error('Pinata JSON upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get IPFS URL from hash
   */
  getIPFSUrl(ipfsHash: string): string {
    return `${PINATA_GATEWAY}${ipfsHash}`
  }

  /**
   * Check if Pinata is configured
   */
  isConfigured(): boolean {
    return !!(PINATA_API_KEY && PINATA_SECRET_KEY)
  }
}

// Singleton instance
export const pinataService = new PinataService()

