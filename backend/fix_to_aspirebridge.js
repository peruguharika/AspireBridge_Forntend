const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
console.log('Updating .env to use aspirebridge database...');

if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf8');

    // Replace mentorconnect with aspirebridge
    if (content.includes('/mentorconnect?')) {
        content = content.replace('/mentorconnect?', '/aspirebridge?');
        console.log('Changed mentorconnect -> aspirebridge');
    } else if (content.includes('/test?')) {
        content = content.replace('/test?', '/aspirebridge?');
        console.log('Changed test -> aspirebridge');
    } else if (!content.includes('/aspirebridge?')) {
        // Try to insert aspirebridge before query params
        content = content.replace('.mongodb.net/?', '.mongodb.net/aspirebridge?');
        console.log('Inserted aspirebridge database name');
    } else {
        console.log('Already using aspirebridge');
    }

    fs.writeFileSync(envPath, content, 'utf8');
    console.log('Updated .env successfully.');

} else {
    console.log('File does NOT exist.');
}
