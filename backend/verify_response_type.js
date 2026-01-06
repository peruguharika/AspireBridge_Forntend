const axios = require('axios');

async function testApi() {
    try {
        console.log('Testing GET http://localhost:5000/api/mentorposts ...');
        const response = await axios.get('http://localhost:5000/api/mentorposts');

        console.log('Status:', response.status);
        const data = response.data;

        if (Array.isArray(data)) {
            console.log('✅ Response is an ARRAY. (Correct)');
            console.log('Length:', data.length);
        } else if (typeof data === 'object') {
            console.log('❌ Response is an OBJECT. (Incorrect)');
            console.log('Structure keys:', Object.keys(data));
        } else {
            console.log('❓ Response is:', typeof data);
        }
    } catch (e) {
        console.error('❌ Request Failed:', e.message);
        if (e.response) {
            console.log('Status:', e.response.status);
            console.log('Data:', e.response.data);
        }
    }
}

testApi();
