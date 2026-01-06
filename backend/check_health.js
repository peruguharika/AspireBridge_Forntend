const http = require('http');

console.log("Checking API Health...");
http.get('http://localhost:5000/api/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Response:', data);
        try {
            const json = JSON.parse(data);
            if (json.database === 'Connected') {
                console.log("\n✅ DATABASE IS CONNECTED");
            } else {
                console.log("\n❌ DATABASE IS DISCONNECTED");
            }
        } catch (e) { console.log("Error parsing JSON"); }
        process.exit(0);
    });
}).on('error', err => {
    console.log('Error:', err.message);
    process.exit(1);
});
