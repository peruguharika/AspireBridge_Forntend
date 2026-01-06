const http = require('http');

console.log('Sending request to fix approvals...');
http.get('http://localhost:5000/api/users/fix-approvals-temp', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Response:', data);
        process.exit(0);
    });
}).on('error', err => {
    console.log('Error:', err.message);
    process.exit(1);
});
