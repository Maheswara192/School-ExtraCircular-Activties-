const axios = require('axios');

(async () => {
    try {
        console.log("Fetching events...");
        const res = await axios.get('http://localhost:5000/api/events?limit=100');
        console.log("Status:", res.status);
        console.log("Data Type:", Array.isArray(res.data) ? 'Array' : typeof res.data);
        console.log("Data keys:", Object.keys(res.data));
        if (res.data.data) {
            console.log("res.data.data length:", res.data.data.length);
        } else if (Array.isArray(res.data)) {
            console.log("res.data length:", res.data.length);
        }

        // Print first event to check categories
        const first = Array.isArray(res.data) ? res.data[0] : res.data.data[0];
        console.log("First Event:", JSON.stringify(first, null, 2));

    } catch (error) {
        console.error("API Error:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
        }
    }
})();
