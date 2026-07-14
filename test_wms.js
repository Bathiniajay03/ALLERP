const axios = require('axios');

async function testWMS() {
    try {
        // Assume port 5157 for API
        const baseUrl = 'http://localhost:5157/api';
        
        // 1. Get an item to put away
        console.log("Checking for items...");
        // This is tricky without an auth token. Let's get a token first.
        const loginRes = await axios.post(`${baseUrl}/auth/login`, {
            email: 'admin@mind.com', // Using standard seed admin
            password: 'password'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        console.log("Logged in successfully. Token acquired.");

        // 2. Fetch a bin to test sequential scanning
        console.log("Fetching debug bins...");
        const binsRes = await axios.get(`${baseUrl}/wms-scanner/debug-bins`, config);
        const bins = binsRes.data;
        if (bins.length === 0) {
            console.log("No bins found in DB to test with.");
            return;
        }
        
        const testBin = bins[0];
        console.log(`Found test bin: ${testBin.code} (Barcode: ${testBin.barcode})`);
        
        // 3. Test sequential scanning endpoints
        // Actually, the sequential scan calls `/barcode/scan/{barcode}` which is likely in BarcodeController
        console.log("Testing location barcode scan (Zone/Aisle/Rack/Shelf/Bin)...");
        try {
            const scanRes = await axios.get(`${baseUrl}/barcode/scan/${testBin.barcode}`, config);
            console.log("Barcode scan result:", scanRes.data.data.type);
        } catch(e) {
            console.error("Barcode scan endpoint failed:", e.response ? e.response.data : e.message);
        }
        
    } catch(err) {
        console.error("Test failed:", err.response ? err.response.data : err.message);
    }
}

testWMS();
