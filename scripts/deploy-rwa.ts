import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const NETWORK = process.env.VITE_SUI_NETWORK || 'mainnet';
const PACKAGE_PATH = path.join(process.cwd(), 'sui_rwa');

console.log(`🚀 Starting deployment for network: ${NETWORK}`);
console.log(`📂 Package Path: ${PACKAGE_PATH}`);

try {
    // 1. Resolve Sui Binary
    let suiPath = 'sui';
    const localBin = path.join(process.cwd(), 'bin', 'sui');
    if (fs.existsSync(localBin)) {
        console.log(`✅ Using local Sui binary: ${localBin}`);
        suiPath = localBin;
    } else {
        console.log('ℹ️ Using global Sui binary');
    }

    // 2. Build
    console.log('\n🔨 Building Move package...');
    execSync(`${suiPath} move build`, { cwd: PACKAGE_PATH, stdio: 'inherit' });

    // 3. Dry Run / Estimate Cost
    console.log('\n💰 Estimating deployment cost (Dry Run)...');
    try {
        execSync(`${suiPath} client publish --gas-budget 100000000 --dry-run`, { cwd: PACKAGE_PATH, stdio: 'inherit' });
    } catch (e) {
        console.warn('⚠️ Dry run failed or CLI not configured via script. Ensure "sui client" is active.');
    }

    console.log('\n⚠️ To deploy for real, run:');
    console.log(`cd ${PACKAGE_PATH} && sui client publish --gas-budget 100000000 --skip-dependency-verification`);

} catch (error) {
    console.error('❌ Deployment script failed:', error);
}
