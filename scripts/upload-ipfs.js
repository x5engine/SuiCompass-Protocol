import { create } from 'ipfs-http-client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globby } from 'globby';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use public IPFS gateway
const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

async function uploadDirectory() {
    console.log('🚀 Uploading to IPFS...');

    const distPath = path.join(__dirname, '../dist');
    const files = await globby('**/*', { cwd: distPath, onlyFiles: true });

    const fileObjects = [];
    for (const file of files) {
        const filePath = path.join(distPath, file);
        const content = fs.readFileSync(filePath);
        fileObjects.push({
            path: file,
            content
        });
    }

    let rootCid;
    for await (const result of ipfs.addAll(fileObjects, { wrapWithDirectory: true })) {
        if (result.path === '') {
            rootCid = result.cid.toString();
        }
    }

    console.log('✅ Upload Complete!');
    console.log('CID:', rootCid);
    console.log('IPFS URL:', `https://ipfs.io/ipfs/${rootCid}`);
    console.log('Gateway URL:', `https://gateway.ipfs.io/ipfs/${rootCid}`);
}

uploadDirectory().catch(console.error);
