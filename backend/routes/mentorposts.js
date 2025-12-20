const express = require('express');
const router = express.Router();
const MentorPost = require('../models/MentorPost');
const { authenticateToken } = require('../middleware/auth');

// @route   POST /api/mentorposts
// @desc    Create mentor post
// @access  Private (Achievers only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { mentorName, content, mediaUrl, mediaType } = req.body;

    const post = new MentorPost({
      mentorId: req.user.id,
      mentorName,
      content,
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || 'none'
    });

    await post.save();

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
});

// @route   GET /api/mentorposts/debug
// @desc    Debug mentor data
// @access  Public
router.get('/debug', async (req, res) => {
  try {
    const posts = await MentorPost.find()
      .populate('mentorId')
      .sort({ createdAt: -1 });

    const debugInfo = posts.map(post => ({
      postId: post._id,
      mentorName: post.mentorName,
      mentor: post.mentorId ? {
        name: post.mentorId.name,
        examType: post.mentorId.examType,
        examCategory: post.mentorId.examCategory,
        examSubCategory: post.mentorId.examSubCategory
      } : null,
      content: post.content.substring(0, 50) + '...'
    }));

    res.json({
      success: true,
      debugInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/mentorposts/auth-test
// @desc    Test authentication
// @access  Private
router.get('/auth-test', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Authentication working!',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/mentorposts
// @desc    Get all mentor posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { mentorId, category } = req.query;
    
    let query = {};
    if (mentorId) query.mentorId = mentorId;

    const posts = await MentorPost.find(query)
      .populate('mentorId', 'name email examType examCategory examSubCategory examCleared rank year bio photoUrl')
      .sort({ createdAt: -1 });

    // Filter by category if specified
    let filteredPosts = posts;
    if (category && category !== 'All') {
      filteredPosts = posts.filter(post => {
        const mentor = post.mentorId;
        if (!mentor) return false;
        
        // Get mentor's exam fields
        const mentorCategory = (mentor.examCategory || '').toLowerCase();
        const mentorSubCategory = (mentor.examSubCategory || '').toLowerCase();
        const mentorType = (mentor.examType || '').toLowerCase();
        const filterCategory = category.toLowerCase();
        
        console.log(`🔍 Filtering post for mentor ${mentor.name}:`, {
          filterCategory,
          mentorCategory,
          mentorType,
          mentorSubCategory
        });
        
        // Check for exact matches or logical category matches
        switch (filterCategory) {
          case 'upsc':
            return mentorCategory === 'upsc' || 
                   mentorType === 'upsc' || 
                   mentorSubCategory.includes('upsc');
          
          case 'ssc':
            return mentorCategory === 'ssc' || 
                   mentorType === 'ssc' || 
                   mentorSubCategory.includes('ssc');
          
          case 'banking':
            return mentorCategory === 'banking' || 
                   mentorType === 'banking' || 
                   mentorSubCategory.includes('bank');
          
          case 'railways':
            return mentorCategory === 'railways' || 
                   mentorType === 'railways' || 
                   mentorSubCategory.includes('railway');
          
          case 'state psc':
            return mentorCategory === 'state psc' || 
                   mentorType === 'state psc' || 
                   mentorSubCategory.includes('psc');
          
          case 'defense':
            return mentorCategory === 'defense' || 
                   mentorType === 'defense' || 
                   mentorSubCategory.includes('defense');
          
          default:
            // For other categories, do exact match
            return mentorCategory === filterCategory || 
                   mentorType === filterCategory || 
                   mentorSubCategory.includes(filterCategory);
        }
      });
    }

    res.json({
      success: true,
      count: filteredPosts.length,
      posts: filteredPosts
    });

  } catch (error) {
    console.error('Get Posts Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
});

// @route   POST /api/mentorposts/:id/like
// @desc    Like/Unlike post
// @access  Private
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await MentorPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = req.user.id;
    const likedIndex = post.likedBy.indexOf(userId);

    if (likedIndex > -1) {
      post.likedBy.splice(likedIndex, 1);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();

    res.json({
      success: true,
      likes: post.likes,
      isLiked: likedIndex === -1
    });

  } catch (error) {
    console.error('Like Post Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post',
      error: error.message
    });
  }
});

// @route   DELETE /api/mentorposts/:id
// @desc    Delete post
// @access  Private (Owner or Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await MentorPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.mentorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await MentorPost.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete Post Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
});

module.exports = router;