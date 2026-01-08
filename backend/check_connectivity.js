const axios = require('axios');

const IP = '192.168.137.168';
const PORT = 5000;
const URL = `http://${IP}:${PORT}/api/auth/test`; // Try a simple endpoint, or just root

async function checkServer() {
    console.log(`Testing connectivity to ${URL}...`);
    try {
        const response = await axios.get(`http://${IP}:${PORT}/`);
        console.log('✅ Server is reachable!');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.log('❌ Server check failed.');
        console.log('Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('⚠️  Connection Refused: Server might not be running or IP/Port is wrong.');
        } else if (error.code === 'ETIMED OUT') {
            console.log('⚠️  Connection Timed Out: Firewall or network issue.');
        }
    }
}

checkServer();
