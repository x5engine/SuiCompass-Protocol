
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PINATA_JWT = process.env.JWT_PINATA || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyNTE4MDBjNy00ZWM5LTQ5ZmYtYmM2Yi1lMTRmYTQ4NjlmNWEiLCJlbWFpbCI6ImNob3Vmem9ycm9AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImVlOTQ1MGM0NmM0ZTJkZTk2YmU2Iiwic2NvcGVkS2V5U2VjcmV0IjoiOGUzNzBiY2Y1ZmI3M2RmYWVhYjExZTIzODdiMWIyY2YxMmIzNmI3ZDA1ZDZlOGM5ZDVjOTc1MDczN2EyNjM2NCIsImV4cCI6MTgwMTc2MjM0OH0.tZ_Hb6ztSRwX9jkIKwV_C-4-m0u_vEtKQzIzavDvjz0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist/index.html'); // Try index.html first

async function deploy() {
    console.log('🚀 Last Resort Deployment (Axios)...');

    const formData = new FormData();
    formData.append('file', fs.createReadStream(distPath));
    formData.append('pinataMetadata', JSON.stringify({ name: 'SuiCompass-Index' }));
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`,
                ...formData.getHeaders()
            }
        });
        console.log("✅ Success! CID:", res.data.IpfsHash);
    } catch (error) {
        console.error("❌ Failed:", error.response ? error.response.data : error.message);
    }
}

deploy();
