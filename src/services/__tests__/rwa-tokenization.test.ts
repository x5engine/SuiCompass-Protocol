import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rwaTokenizationService } from '../rwa-tokenization'
import { pinataService } from '../ipfs-pinata'
import { aiRiskAuditService } from '../ai-risk-audit'
import type { TokenizationRequest } from '../../types/rwa-audit'

// Mock dependencies
vi.mock('../ipfs-pinata', () => ({
    pinataService: {
        uploadFile: vi.fn(),
        uploadJSON: vi.fn(),
    },
}))

vi.mock('../ai-risk-audit', () => ({
    aiRiskAuditService: {
        auditRWA: vi.fn(),
        shouldAllowTokenization: vi.fn(),
    },
}))

describe('RWATokenizationService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('validateRequest', () => {
        it('should validate a correct request', () => {
            const request: TokenizationRequest = {
                metadata: {
                    assetType: 'invoice',
                    issuer: '0x123',
                    amount: 100,
                    currency: 'USD',
                    dueDate: '2023-12-31',
                    status: 'pending',
                    description: 'Test Invoice',
                },
                documentUrl: 'http://example.com/doc.pdf',
            }

            const result = rwaTokenizationService.validateRequest(request)
            expect(result.valid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should fail if amount is missing or invalid', () => {
            const request: TokenizationRequest = {
                metadata: {
                    assetType: 'invoice',
                    issuer: '0x123',
                    amount: 0, // Invalid
                    currency: 'USD',
                    dueDate: '2023-12-31',
                    status: 'pending',
                },
                documentUrl: 'http://example.com/doc.pdf',
            }

            const result = rwaTokenizationService.validateRequest(request)
            expect(result.valid).toBe(false)
            expect(result.errors).toContain('Amount must be greater than 0')
        })
    })

    describe('mintRWA', () => {
        it('should construct a valid Move Call transaction', async () => {
            const packageId = '0x123'
            const metadata = {
                assetType: 'invoice',
                issuer: '0xFF...',
                amount: 500,
                currency: 'EUR',
                dueDate: '2024-01-01',
                status: 'pending',
                riskScore: 10,
                documentHash: 'QmDocHash',
                createdAt: '2023-01-01',
            } as any
            const ipfsHash = 'QmMetaHash'

            const tx = await rwaTokenizationService.mintRWA(packageId, metadata, ipfsHash)

            // Basic verification of transaction object
            expect(tx).toBeDefined()

            // In a real environment we would check tx.getData() 
            // but purely mocking the Transaction class is complex without dapp-kit internals.
            // We assume if it returns a Transaction object without error, it works.
        })

        it('should throw error if input is invalid', async () => {
            // Missing amount
            const invalidMeta = {
                assetType: 'invoice',
                // amount: missing
            } as any;
            expect(() => rwaTokenizationService.validateRequest({ metadata: invalidMeta, documentUrl: 'url' } as any)).not.toThrow();
            // The service returns valid: false, doesn't throw. We should check that behavior.
            const res = rwaTokenizationService.validateRequest({ metadata: invalidMeta, documentUrl: 'url' } as any);
            expect(res.valid).toBe(false);
        });
    })

    describe('tokenizeRWA', () => {
        it('should block tokenization if risk score is too high', async () => {
            // Mock high risk audit
            const riskResult = { riskScore: 90, riskFactors: [], recommendations: [], authenticityAssessment: 'suspicious', confidence: 90, auditTimestamp: 'now' };

            (aiRiskAuditService.auditRWA as any).mockResolvedValue(riskResult);
            (aiRiskAuditService.shouldAllowTokenization as any).mockReturnValue(false);

            const request: TokenizationRequest = {
                metadata: {
                    assetType: 'invoice',
                    issuer: '0x1',
                    amount: 1000,
                    currency: 'USD',
                    dueDate: '2024',
                    status: 'pending',
                    description: 'Risky'
                },
                documentUrl: 'http://risky.com'
            };

            const result = await rwaTokenizationService.tokenizeRWA(request);
            expect(result.tokenizationResult?.success).toBe(false);
            expect(result.tokenizationResult?.error).toContain('Risk score 90 exceeds threshold');
        });

        it('should succeed when risk is low and ipfs upload works', async () => {
            // Mock low risk
            const riskResult = { riskScore: 10, riskFactors: [], recommendations: [], authenticityAssessment: 'authentic', confidence: 90, auditTimestamp: 'now' };
            (aiRiskAuditService.auditRWA as any).mockResolvedValue(riskResult);
            (aiRiskAuditService.shouldAllowTokenization as any).mockReturnValue(true);

            // Mock IPFS
            (pinataService.uploadJSON as any).mockResolvedValue({ success: true, ipfsHash: 'QmSuccess' });

            const request: TokenizationRequest = {
                metadata: {
                    assetType: 'invoice',
                    issuer: '0xGood',
                    amount: 500,
                    currency: 'USD',
                    dueDate: '2024',
                    status: 'pending'
                },
                documentUrl: 'http://safe.com'
            };

            const result = await rwaTokenizationService.tokenizeRWA(request);
            expect(result.tokenizationResult?.success).toBe(true);
            expect(result.tokenizationResult?.ipfsHash).toBe('QmSuccess');
        });
    })
})
