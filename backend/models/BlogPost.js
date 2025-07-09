const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogPost:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the blog post
 *         title:
 *           type: string
 *           description: Title of the blog post
 *         content:
 *           type: string
 *           description: Content of the blog post
 *         excerpt:
 *           type: string
 *           description: Auto-generated excerpt from content
 *         image:
 *           type: string
 *           description: URL to the blog post's featured image
 *         author:
 *           type: string
 *           description: ID of the user who created the post
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who liked the post
 *         likesCount:
 *           type: number
 *           description: Total number of likes
 *         commentsCount:
 *           type: number
 *           description: Total number of comments
 *         published:
 *           type: boolean
 *           description: Whether the post is published
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the post was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the post was last updated
 *       example:
 *         _id: 60d0fe4f5311236168a109cb
 *         title: "Getting Started with React"
 *         content: "React is a powerful JavaScript library..."
 *         excerpt: "React is a powerful JavaScript library for building user interfaces..."
 *         image: "https://example.com/react-image.jpg"
 *         author: 60d0fe4f5311236168a109ca
 *         likes: ["60d0fe4f5311236168a109ca"]
 *         likesCount: 1
 *         commentsCount: 3
 *         published: true
 *         createdAt: 2021-06-21T17:16:40.000Z
 *         updatedAt: 2021-06-21T17:16:40.000Z
 */

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [50, 'Content must be at least 50 characters long']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  image: {
    type: String,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  published: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  readTime: {
    type: Number, // in minutes
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comments
blogPostSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post'
});

// Indexes for better query performance
blogPostSchema.index({ author: 1 });
blogPostSchema.index({ createdAt: -1 });
blogPostSchema.index({ published: 1 });
blogPostSchema.index({ title: 'text', content: 'text' }); // Text search index

// Pre-save middleware to generate excerpt and calculate read time
blogPostSchema.pre('save', function(next) {
  // Generate excerpt if not provided
  if (!this.excerpt && this.content) {
    // Remove HTML tags and get first 150 characters
    const plainText = this.content.replace(/<[^>]*>/g, '');
    this.excerpt = plainText.length > 150 
      ? plainText.substring(0, 150) + '...' 
      : plainText;
  }
  
  // Calculate read time (average reading speed: 200 words per minute)
  if (this.content) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }
  
  next();
});

// Instance method to check if user has liked the post
blogPostSchema.methods.isLikedBy = function(userId) {
  return this.likes.includes(userId);
};

// Instance method to toggle like
blogPostSchema.methods.toggleLike = function(userId) {
  const userIdString = userId.toString();
  const likeIndex = this.likes.findIndex(id => id.toString() === userIdString);
  
  if (likeIndex > -1) {
    // User has already liked, remove the like
    this.likes.splice(likeIndex, 1);
    this.likesCount = Math.max(0, this.likesCount - 1);
    return false; // unliked
  } else {
    // User hasn't liked, add the like
    this.likes.push(userId);
    this.likesCount += 1;
    return true; // liked
  }
};

// Static method to get published posts with pagination
blogPostSchema.statics.getPublishedPosts = function(page = 1, limit = 10, sortBy = '-createdAt') {
  const skip = (page - 1) * limit;
  
  return this.find({ published: true })
    .populate('author', 'username firstName lastName avatar')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .lean();
};

// Static method to search posts
blogPostSchema.statics.searchPosts = function(query, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $and: [
      { published: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  })
  .populate('author', 'username firstName lastName avatar')
  .sort('-createdAt')
  .skip(skip)
  .limit(limit)
  .lean();
};

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;

