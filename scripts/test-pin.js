
import pinataSDK from '@pinata/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const apiKey = 'ee9450c46c4e2de96be6';
const apiSecret = '8e370bcf5fb73dfaeab11e2387b1b2cf12b36b7d05d6e8c9d5c9750737a26364';
const pinata = new pinataSDK(apiKey, apiSecret);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '../dist/index.html');

async function testPin() {
    console.log('Testing pinFileToIPFS...');
    try {
        const readableStreamForFile = fs.createReadStream(filePath);
        const result = await pinata.pinFileToIPFS(readableStreamForFile, {
            pinataMetadata: { name: 'Test-Pin' }
        });
        console.log('✅ Pin Success:', result);
    } catch (error) {
        console.error('❌ Pin Failed:', error.message);
        if (error.response) console.error('Status:', error.response.status);
    }
}

testPin();
