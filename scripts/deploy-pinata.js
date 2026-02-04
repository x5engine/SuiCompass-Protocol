
import pinataSDK from '@pinata/sdk';
import path from 'path';
import { fileURLToPath } from 'url';

// User provided API Keys
const apiKey = 'ee9450c46c4e2de96be6';
const apiSecret = '8e370bcf5fb73dfaeab11e2387b1b2cf12b36b7d05d6e8c9d5c9750737a26364';

const pinata = new pinataSDK(apiKey, apiSecret);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourcePath = path.join(__dirname, '../dist');

async function deploy() {
    console.log('🚀 Starting Pinata Deployment...');
    console.log(`Source: ${sourcePath}`);

    try {
        const result = await pinata.pinFromFS(sourcePath, {
            pinataMetadata: {
                name: 'SuiCompass-Protocol-V1'
            }
        });
        console.log('✅ Deployment Successful!');
        console.log('IPFS Hash (CID):', result.IpfsHash);
        console.log('Gateway URL:', `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
    } catch (error) {
        console.error('❌ Deployment Failed:', error.message);
        if (error.message.includes('EISDIR')) {
            console.log('ℹ️ Note: EISDIR is sometimes a misleading error from @pinata/sdk when auth fails or path is tricky. Trying pinAtomic...');
        }
    }
}

deploy();
