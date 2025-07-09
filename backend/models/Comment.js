const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - author
 *         - post
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the comment
 *         content:
 *           type: string
 *           description: Content of the comment
 *         author:
 *           type: string
 *           description: ID of the user who created the comment
 *         post:
 *           type: string
 *           description: ID of the blog post this comment belongs to
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the comment was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the comment was last updated
 *       example:
 *         _id: 60d0fe4f5311236168a109cc
 *         content: "Great article! Very helpful."
 *         author: 60d0fe4f5311236168a109ca
 *         post: 60d0fe4f5311236168a109cb
 *         createdAt: 2021-06-21T17:16:40.000Z
 *         updatedAt: 2021-06-21T17:16:40.000Z
 */

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment must be at least 1 character long'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment author is required']
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: [true, 'Post reference is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

// Post-save middleware to update comment count in blog post
commentSchema.post('save', async function() {
  try {
    const BlogPost = mongoose.model('BlogPost');
    const commentCount = await mongoose.model('Comment').countDocuments({ post: this.post });
    await BlogPost.findByIdAndUpdate(this.post, { commentsCount: commentCount });
  } catch (error) {
    console.error('Error updating comment count:', error);
  }
});

// Post-remove middleware to update comment count in blog post
commentSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const BlogPost = mongoose.model('BlogPost');
      const commentCount = await mongoose.model('Comment').countDocuments({ post: doc.post });
      await BlogPost.findByIdAndUpdate(doc.post, { commentsCount: commentCount });
    } catch (error) {
      console.error('Error updating comment count after deletion:', error);
    }
  }
});

// Static method to get comments for a post with pagination
commentSchema.statics.getCommentsForPost = function(postId, page = 1, limit = 20, sortBy = '-createdAt') {
  const skip = (page - 1) * limit;
  
  return this.find({ post: postId })
    .populate('author', 'username firstName lastName avatar')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .lean();
};

// Static method to get comment count for a post
commentSchema.statics.getCommentCount = function(postId) {
  return this.countDocuments({ post: postId });
};

// Instance method to check if user is the author
commentSchema.methods.isAuthor = function(userId) {
  return this.author.toString() === userId.toString();
};

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

