const express = require('express');
const router = express.Router();
const SuccessStory = require('../models/SuccessStory');
const { authenticateToken } = require('../middleware/auth');

// @route   GET /api/successstories
// @desc    Get all success stories
// @access  Private (or Public)
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Return array of objects for simplicity as seen in ApiService (List<Map>)
        // Or wrap in { success: true, stories: [] }
        // ApiService expects List<Map<String, Any>> -> Response<List<Map...>>
        // So we should return a JSON array directly? 
        // Wait, ApiService: suspend fun getSuccessStories(): Response<List<Map<String, Any>>>
        // This implies the response body itself is the List.
        // Unlike others where it's Response<SuccessResponse> which has a list inside.

        // Let's return the list directly or look at other endpoints.
        // Usually standard is { success: true, data: [] }. 
        // But if Retrofit interface says `List<Map>`, it expects `[{}, {}]`.

        const stories = await SuccessStory.find().sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/successstories
// @desc    Add a success story
// @access  Private (Admin)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const newStory = new SuccessStory(req.body);
        const story = await newStory.save();
        res.json(story);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
