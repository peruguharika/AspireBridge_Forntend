import { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share2, Image as ImageIcon, Video, Trash2, X } from 'lucide-react';
import { mentorPostAPI } from '../utils/api';

// Helper function to convert file to data URL
const convertFileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface MentorPostsProps {
  userId: string;
  userType: string;
  mentorId?: string;
  category?: string;
  isAdmin?: boolean;
  userName?: string;
}

export function MentorPosts({ userId, userType, mentorId, category, isAdmin = false, userName }: MentorPostsProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({
    content: '',
    mediaUrl: '',
    mediaType: 'none'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 MentorPosts useEffect triggered', { userId, userType, mentorId, category });
    fetchPosts();
  }, [mentorId, category, userId, userType]);

  // Scroll to top when modal opens
  useEffect(() => {
    if (showCreateModal) {
      document.body.style.overflow = 'hidden';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCreateModal]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching mentor posts...', { mentorId, category, userId, userType });
      
      // Clear posts first to show loading state
      setPosts([]);
      
      const filters: any = {};
      if (mentorId) filters.mentorId = mentorId;
      if (category && category !== 'All') filters.category = category;
      
      // Add cache busting for public requests
      if (userType === 'public') {
        filters._t = Date.now();
      }
      
      console.log('📤 Sending filters to API:', filters);
      const response = await mentorPostAPI.getAll(filters);
      console.log('📡 Posts API response:', response);
      
      if (response.success) {
        console.log('✅ Posts loaded:', response.posts?.length || 0);
        console.log('📋 Posts data:', response.posts?.map((p: any) => ({
          id: p._id,
          mentorName: p.mentorName,
          mentor: p.mentorId ? {
            name: p.mentorId.name,
            examCategory: p.mentorId.examCategory,
            examType: p.mentorId.examType,
            examSubCategory: p.mentorId.examSubCategory
          } : null
        })));
        setPosts(response.posts || []);
      } else {
        console.error('❌ Posts API failed:', response.message);
        setPosts([]);
      }
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('🔍 Creating post with userName:', userName);
      console.log('🔍 Full props:', { userId, userType, userName });
      console.log('🔍 userName type:', typeof userName);
      console.log('🔍 userName value:', JSON.stringify(userName));
      
      // Check if userName is valid
      if (!userName || userName.trim() === '') {
        console.error('❌ userName is empty or invalid:', userName);
        alert('Error: User name not available. Please refresh the page and try again.');
        return;
      }
      
      let mediaUrl = newPost.mediaUrl;
      
      // If a file is selected, convert it to data URL
      if (selectedFile) {
        mediaUrl = await convertFileToDataUrl(selectedFile);
      }

      const postData = {
        content: newPost.content,
        mediaUrl: mediaUrl,
        mediaType: newPost.mediaType,
        mentorId: userId,
        mentorName: userName
      };
      
      console.log('📤 Sending post data:', postData);

      const response = await mentorPostAPI.create(postData);

      if (response.success) {
        setShowCreateModal(false);
        fetchPosts();
        setNewPost({ content: '', mediaUrl: '', mediaType: 'none' });
        setSelectedFile(null);
        setFilePreview(null);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (newPost.mediaType === 'photo' && !file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (newPost.mediaType === 'video' && !file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    // Validate file size (max 10MB for images, 50MB for videos)
    const maxSize = newPost.mediaType === 'photo' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size must be less than ${newPost.mediaType === 'photo' ? '10MB' : '50MB'}`);
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const preview = await convertFileToDataUrl(file);
    setFilePreview(preview);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleLike = async (postId: string) => {
    try {
      await mentorPostAPI.like(postId);
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const token = isAdmin ? localStorage.getItem('adminToken') : localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:5000/api/mentorposts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (data.success) {
          fetchPosts();
        } else {
          alert('Failed to delete post: ' + data.message);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Post Button */}
      {userType === 'achiever' && !mentorId && userId && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          {!userName || userName.trim() === '' ? (
            <div className="w-full py-3 border-2 border-dashed border-red-300 rounded-lg text-red-600 text-center font-medium">
              Loading user data... If this persists, please refresh the page
            </div>
          ) : (
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
            >
              Share your knowledge with students...
            </button>
          )}
        </div>
      )}

      {/* Posts Feed */}
      {posts.map((post) => (
        <div key={post._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Post Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {post.mentorName?.charAt(0) || 'M'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{post.mentorName}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            {(userId && userId === post.mentorId) || isAdmin ? (
              <button
                onClick={() => handleDelete(post._id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 text-gray-600" />
              </button>
            ) : null}
          </div>

          {/* Post Content */}
          <div className="px-4 pb-4">
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Post Media */}
          {post.mediaUrl && (
            <div className="relative">
              {post.mediaType === 'photo' && (
                <img
                  src={post.mediaUrl}
                  alt="Post media"
                  className="w-full max-h-96 object-cover"
                />
              )}
              {post.mediaType === 'video' && (
                <video
                  src={post.mediaUrl}
                  controls
                  className="w-full max-h-96"
                />
              )}
            </div>
          )}

          {/* Post Actions */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleLike(post._id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.likes || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.comments || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      )}

      {/* No Posts */}
      {!loading && posts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No posts yet</p>
          <p className="text-gray-500 text-sm mt-2">
            {userType === 'public' ? 'Be the first to share your success story!' : 'Start sharing your knowledge with students!'}
          </p>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Post</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's on your mind?
                </label>
                <textarea
                  required
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your tips, strategies, or motivational thoughts..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media Type
                </label>
                <select
                  value={newPost.mediaType}
                  onChange={(e) => {
                    setNewPost({ ...newPost, mediaType: e.target.value });
                    // Clear file selection when changing media type
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">Text Only</option>
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                </select>
              </div>

              {newPost.mediaType !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload {newPost.mediaType === 'photo' ? 'Photo' : 'Video'}
                  </label>
                  
                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept={newPost.mediaType === 'photo' ? 'image/*' : 'video/*'}
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        {newPost.mediaType === 'photo' ? (
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        ) : (
                          <Video className="w-12 h-12 text-gray-400" />
                        )}
                        <span className="text-gray-600 font-medium">
                          Click to upload {newPost.mediaType === 'photo' ? 'photo' : 'video'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {newPost.mediaType === 'photo' 
                            ? 'PNG, JPG, GIF up to 10MB' 
                            : 'MP4, MOV, AVI up to 50MB'
                          }
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* File Preview */}
                      <div className="border border-gray-300 rounded-lg p-4">
                        {newPost.mediaType === 'photo' && filePreview && (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-full max-h-64 object-cover rounded-lg"
                          />
                        )}
                        {newPost.mediaType === 'video' && filePreview && (
                          <video
                            src={filePreview}
                            controls
                            className="w-full max-h-64 rounded-lg"
                          />
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPost({ content: '', mediaUrl: '', mediaType: 'none' });
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
