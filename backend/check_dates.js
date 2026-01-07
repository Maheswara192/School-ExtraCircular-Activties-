const axios = require('axios');

async function checkEvents() {
    try {
        const res = await axios.get('http://localhost:5000/api/events?limit=5');
        const events = res.data.data;
        console.log("Current Date:", new Date().toISOString());
        console.log("Events found:", events.length);
        events.forEach(e => {
            console.log(`- ${e.eventName}: ${e.date} (Is Past: ${new Date(e.date) < new Date()})`);
        });
    } catch (err) {
        console.error("Error:", err.message);
    }
}
checkEvents();
