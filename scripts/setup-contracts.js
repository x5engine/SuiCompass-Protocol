import { execSync } from 'child_process';

const PACKAGE_ID = '0x9cab3a40743b2ee7d6aedb268135fda191d94b14c90a9201d5a713c085b216c4';
const GAS_BUDGET = '500000000';

console.log('🚀 Starting Post-Deployment Setup...');
console.log(`📦 Package: ${PACKAGE_ID}`);

function runCommand(cmd) {
    try {
        console.log(`\n> ${cmd}`);
        const output = execSync(cmd, { encoding: 'utf-8' });
        console.log(output);
        return output;
    } catch (e) {
        console.error('❌ Command failed:', e.message);
        return null;
    }
}

// 3. Initialize Lossless Lottery
console.log('\n--- 3. Setting up Lossless Lottery ---');
runCommand(`sui client call --package ${PACKAGE_ID} --module lossless_lottery --function create_pool --gas-budget ${GAS_BUDGET}`);

// 4. Initialize Reputation Admin
console.log('\n--- 4. Setting up Reputation System ---');
runCommand(`sui client call --package ${PACKAGE_ID} --module reputation_id --function init_admin --gas-budget ${GAS_BUDGET}`);

// 5. Initialize Bridge Config
console.log('\n--- 5. Setting up Bridge ---');
runCommand(`sui client call --package ${PACKAGE_ID} --module bridge_adaptor --function create_config --gas-budget ${GAS_BUDGET}`);

console.log('\n✅ Setup script finished. Please check output for Shared Object IDs.');
