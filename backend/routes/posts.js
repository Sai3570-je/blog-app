const express = require('express');
const { body, validationResult, query } = require('express-validator');
const BlogPost = require('../models/BlogPost');
const { authenticateToken, optionalAuth, checkOwnership } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Blog Posts
 *   description: Blog post management
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all blog posts with pagination
 *     tags: [Blog Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of posts per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: ['-createdAt', 'createdAt', '-likesCount', 'likesCount', '-title', 'title']
 *           default: '-createdAt'
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for title and content
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BlogPost'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalPosts:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       500:
 *         description: Server error
 */
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sort').optional().isIn(['-createdAt', 'createdAt', '-likesCount', 'likesCount', '-title', 'title']).withMessage('Invalid sort parameter')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || '-createdAt';
    const search = req.query.search;

    let posts;
    let totalPosts;

    if (search) {
      // Search posts
      posts = await BlogPost.searchPosts(search, page, limit);
      totalPosts = await BlogPost.countDocuments({
        $and: [
          { published: true },
          {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { content: { $regex: search, $options: 'i' } },
              { tags: { $in: [new RegExp(search, 'i')] } }
            ]
          }
        ]
      });
    } else {
      // Get all published posts
      posts = await BlogPost.getPublishedPosts(page, limit, sort);
      totalPosts = await BlogPost.countDocuments({ published: true });
    }

    // Add user-specific data if authenticated
    if (req.user) {
      posts = posts.map(post => ({
        ...post,
        isLiked: post.likes.includes(req.user._id.toString()),
        isOwner: post.author._id.toString() === req.user._id.toString()
      }));
    }

    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single blog post by ID
 *     tags: [Blog Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post ID
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BlogPost'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add user-specific data if authenticated
    if (req.user) {
      post.isLiked = post.likes.includes(req.user._id.toString());
      post.isOwner = post.author._id.toString() === req.user._id.toString();
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post'
    });
  }
});

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blog Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *               content:
 *                 type: string
 *                 minLength: 50
 *               excerpt:
 *                 type: string
 *                 maxLength: 300
 *               image:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               published:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/BlogPost'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters long'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, excerpt, image, tags, published } = req.body;

    // Create new blog post
    const post = new BlogPost({
      title,
      content,
      excerpt,
      image,
      tags: tags || [],
      published: published !== undefined ? published : true,
      author: req.user._id
    });

    await post.save();

    // Populate author information
    await post.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post'
    });
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a blog post
 *     tags: [Blog Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *               content:
 *                 type: string
 *                 minLength: 50
 *               excerpt:
 *                 type: string
 *                 maxLength: 300
 *               image:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, checkOwnership(BlogPost), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters long'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, excerpt, image, tags, published } = req.body;

    // Update the post
    const updatedPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(content && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(image !== undefined && { image }),
        ...(tags && { tags }),
        ...(published !== undefined && { published })
      },
      { new: true, runValidators: true }
    ).populate('author', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating post'
    });
  }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Blog Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, checkOwnership(BlogPost), async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post'
    });
  }
});

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Like or unlike a blog post
 *     tags: [Blog Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post ID
 *     responses:
 *       200:
 *         description: Like status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 *                     likesCount:
 *                       type: number
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Toggle like
    const liked = post.toggleLike(req.user._id);
    await post.save();

    res.json({
      success: true,
      message: liked ? 'Post liked successfully' : 'Post unliked successfully',
      data: {
        liked,
        likesCount: post.likesCount
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating like status'
    });
  }
});

module.exports = router;

