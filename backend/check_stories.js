const mongoose = require('mongoose');
require('dotenv').config();

const SuccessStorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    company: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    story: { type: String, required: true },
    quote: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const SuccessStory = mongoose.model('SuccessStory', SuccessStorySchema);

async function checkStories() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected\n');

        const stories = await SuccessStory.find().sort({ createdAt: -1 });

        console.log(`📚 Found ${stories.length} stories:`);
        stories.forEach(story => {
            console.log(`- ${story.name} (${story.role} at ${story.company})`);
            console.log(`  Story: ${story.story.substring(0, 50)}...`);
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

checkStories();
