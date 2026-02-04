
import { PinataSDK } from "pinata-web3";
import { File } from 'buffer'; // Node < 20 might need this, or global File.
// In Node 20 global File is available. 

const PINATA_JWT = process.env.JWT_PINATA || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyNTE4MDBjNy00ZWM5LTQ5ZmYtYmM2Yi1lMTRmYTQ4NjlmNWEiLCJlbWFpbCI6ImNob3Vmem9ycm9AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImVlOTQ1MGM0NmM0ZTJkZTk2YmU2Iiwic2NvcGVkS2V5U2VjcmV0IjoiOGUzNzBiY2Y1ZmI3M2RmYWVhYjExZTIzODdiMWIyY2YxMmIzNmI3ZDA1ZDZlOGM5ZDVjOTc1MDczN2EyNjM2NCIsImV4cCI6MTgwMTc2MjM0OH0.tZ_Hb6ztSRwX9jkIKwV_C-4-m0u_vEtKQzIzavDvjz0';

const pinata = new PinataSDK({
    pinataJwt: PINATA_JWT,
    pinataGateway: "example-gateway.mypinata.cloud",
});

async function debugDeploy() {
    console.log('🧪 Testing Deployment (Single File)...');
    try {
        // Create a simple file
        const file = new File(["SuiCompass Test Deployment"], "debug.txt", { type: "text/plain" });
        const upload = await pinata.upload.file(file);
        console.log("✅ Debug Upload Success!");
        console.log("CID:", upload.cid);
    } catch (error) {
        console.error("❌ Debug Upload Failed:", error);
    }
}

debugDeploy();
