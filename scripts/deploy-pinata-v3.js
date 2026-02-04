
import { PinataSDK } from "pinata-web3";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Blob } from 'buffer';

// Load JWT from env (or hardcode for this run as user provided it in env file)
// JWT from .env line 27
const PINATA_JWT = process.env.JWT_PINATA || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyNTE4MDBjNy00ZWM5LTQ5ZmYtYmM2Yi1lMTRmYTQ4NjlmNWEiLCJlbWFpbCI6ImNob3Vmem9ycm9AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImVlOTQ1MGM0NmM0ZTJkZTk2YmU2Iiwic2NvcGVkS2V5U2VjcmV0IjoiOGUzNzBiY2Y1ZmI3M2RmYWVhYjExZTIzODdiMWIyY2YxMmIzNmI3ZDA1ZDZlOGM5ZDVjOTc1MDczN2EyNjM2NCIsImV4cCI6MTgwMTc2MjM0OH0.tZ_Hb6ztSRwX9jkIKwV_C-4-m0u_vEtKQzIzavDvjz0';

const pinata = new PinataSDK({
    pinataJwt: PINATA_JWT,
    pinataGateway: "example-gateway.mypinata.cloud", // Placeholder, we just want CID
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

async function deploy() {
    console.log('🚀 Starting Pinata V3 Deployment...');

    try {
        const filePaths = getAllFiles(distPath);
        const files = filePaths.map((filePath) => {
            const buffer = fs.readFileSync(filePath);
            // Create a File-like object. In Node 20+ File exists. 
            // If not, we use Blob. But pinata-web3 expects File.
            // We'll try to use global File if available, or polyfill minimally.
            // Ideally we need to preserve relative paths for a folder upload?
            // "pinata-web3" upload.file is for single file. 
            // Does it support folder? 
            // There is usually upload.json or upload.file. 
            // If we upload multiple files, we likely want to wrap them in a directory.
            // Pinata V3 might treat array of files as folder?
            // Let's try to upload the index.html first to verify it works.
            return new File([buffer], path.relative(distPath, filePath));
        });

        // For folder upload, we usually need an array of files.
        // Let's assume pinata.upload.file takes an array for folder? 
        // Or create a zip? 
        // Docs say: pinata.upload.file(file) -> single file.
        // There is pinata.upload.fileArray(files) in some versions?
        // Let's try to create a File array.

        console.log(`Found ${files.length} files. Uploading...`);

        const upload = await pinata.upload.fileArray(files);
        console.log("✅ Deployment Successful!");
        console.log("Folder CID:", upload.cid);
        console.log("Gateway:", `https://gateway.pinata.cloud/ipfs/${upload.cid}`);

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

deploy();
