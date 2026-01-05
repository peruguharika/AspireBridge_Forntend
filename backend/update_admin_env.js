const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
console.log('Updating .env with admin credentials...');

if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf8');

    // Check if ADMIN_EMAIL exists
    if (content.includes('ADMIN_EMAIL=')) {
        content = content.replace(/ADMIN_EMAIL=.*/g, 'ADMIN_EMAIL=admin@aspirebridge.com');
    } else {
        content += '\nADMIN_EMAIL=admin@aspirebridge.com';
    }

    // Check if ADMIN_PASSWORD exists
    if (content.includes('ADMIN_PASSWORD=')) {
        content = content.replace(/ADMIN_PASSWORD=.*/g, 'ADMIN_PASSWORD=admin123');
    } else {
        content += '\nADMIN_PASSWORD=admin123';
    }

    fs.writeFileSync(envPath, content, 'utf8');
    console.log('Updated .env successfully.');
    console.log('ADMIN_EMAIL=admin@aspirebridge.com');
    console.log('ADMIN_PASSWORD=admin123');

} else {
    console.log('File does NOT exist.');
}
