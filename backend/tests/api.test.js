const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body.status).toBe('OK');
      expect(response.body.message).toBe('Blog Application API is running');
    });
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser123',
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('Blog Posts', () => {
    let authToken;

    beforeAll(async () => {
      // Login to get auth token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        });
      
      authToken = loginResponse.body.data.token;
    });

    it('should get all posts', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toBeDefined();
      expect(Array.isArray(response.body.data.posts)).toBe(true);
    });

    it('should create a new post with authentication', async () => {
      const postData = {
        title: 'Test Blog Post',
        content: 'This is a test blog post content.',
        tags: ['test', 'blog']
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.post.title).toBe(postData.title);
      expect(response.body.data.post.content).toBe(postData.content);
    });

    it('should reject post creation without authentication', async () => {
      const postData = {
        title: 'Test Blog Post',
        content: 'This is a test blog post content.'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('AI Integration', () => {
    let authToken;

    beforeAll(async () => {
      // Login to get auth token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        });
      
      authToken = loginResponse.body.data.token;
    });

    it('should generate title suggestions', async () => {
      const requestData = {
        topic: 'web development',
        count: 3
      };

      const response = await request(app)
        .post('/api/ai/suggest-title')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions).toBeDefined();
      expect(Array.isArray(response.body.data.suggestions)).toBe(true);
      expect(response.body.data.suggestions.length).toBe(3);
    });

    it('should generate content ideas', async () => {
      const requestData = {
        title: 'Introduction to React',
        keywords: ['react', 'javascript', 'frontend']
      };

      const response = await request(app)
        .post('/api/ai/suggest-content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.ideas).toBeDefined();
      expect(Array.isArray(response.body.data.ideas)).toBe(true);
    });

    it('should reject AI requests without authentication', async () => {
      const requestData = {
        topic: 'web development'
      };

      const response = await request(app)
        .post('/api/ai/suggest-title')
        .send(requestData)
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });
});

// Cleanup after tests
afterAll(async () => {
  // Close database connection
  const mongoose = require('mongoose');
  await mongoose.connection.close();
});

