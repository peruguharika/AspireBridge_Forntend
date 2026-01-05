const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
console.log('Updating .env at:', envPath);

if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf8');

    // Use regex to replace the URI or insert the DB name
    // Pattern: mongodb+srv://user:pass@host/OPTIONAL_DB?params

    if (content.includes('mongodb.net/aspirebridge')) {
        console.log('Replacing aspirebridge with mentorconnect...');
        content = content.replace('mongodb.net/aspirebridge', 'mongodb.net/mentorconnect');
    } else if (content.includes('mongodb.net/?')) {
        console.log('Inserting mentorconnect before query params...');
        content = content.replace('mongodb.net/?', 'mongodb.net/mentorconnect?');
    } else if (content.includes('mongodb.net/') && !content.includes('mongodb.net/mentorconnect')) {
        // Catch-all for other names
        console.log('Replacing existing db name with mentorconnect...');
        content = content.replace(/mongodb\.net\/[^?]*\?/, 'mongodb.net/mentorconnect?');
    } else {
        console.log('Could not safely identify where to add DB name. Please check manually.');
        // Fallback: if it doesn't have a slash before params?
    }

    // Double check
    if (content.includes('mongodb.net/mentorconnect')) {
        fs.writeFileSync(envPath, content, 'utf8');
        console.log('Updated .env successfully.');
    } else {
        console.log('Failed to update content as expected.');
        console.log('Content preview:', content.substring(0, 100)); // Be careful with passwords, verify local first
    }

} else {
    console.log('File does NOT exist.');
}
