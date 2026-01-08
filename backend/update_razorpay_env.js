const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

const updates = {
    'RAZORPAY_KEY_ID': 'rzp_test_DrASf34mihEAtB',
    'RAZORPAY_KEY_SECRET': 'X5G49Knpzl2XT0wG0O781nzh'
};

let lines = envContent.split('\n');
const newLines = [];
const updatedKeys = new Set();

for (let line of lines) {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        if (updates[key]) {
            newLines.push(`${key}=${updates[key]}`);
            updatedKeys.add(key);
        } else {
            newLines.push(line);
        }
    } else {
        newLines.push(line);
    }
}

// Add missing keys
for (const [key, value] of Object.entries(updates)) {
    if (!updatedKeys.has(key)) {
        if (newLines[newLines.length - 1] !== '') {
            newLines.push('');
        }
        newLines.push(`${key}=${value}`);
    }
}

fs.writeFileSync(envPath, newLines.join('\n'));
console.log('Updated .env file successfully');
