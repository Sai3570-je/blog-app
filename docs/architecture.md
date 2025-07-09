# Blog Application Architecture

## Overview

This document outlines the architecture for a full-stack blog application built with React frontend and Node.js backend, designed to meet the internship requirements.

## Tech Stack

### Frontend
- **Framework**: React 18
- **UI Library**: Shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form
- **Validation**: Zod

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **File Upload**: Multer
- **CORS**: cors middleware

### Development Tools
- **Package Manager**: npm
- **Environment Variables**: dotenv
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest (backend), React Testing Library (frontend)

## Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  avatar: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### BlogPost Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  content: String (required),
  excerpt: String (auto-generated),
  image: String (optional),
  author: ObjectId (ref: User),
  likes: [ObjectId] (ref: User),
  likesCount: Number (default: 0),
  commentsCount: Number (default: 0),
  published: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Comment Model
```javascript
{
  _id: ObjectId,
  content: String (required),
  author: ObjectId (ref: User),
  post: ObjectId (ref: BlogPost),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Blog Posts Routes
- `GET /api/posts` - Get all blog posts (with pagination)
- `GET /api/posts/:id` - Get single blog post
- `POST /api/posts` - Create new blog post (authenticated)
- `PUT /api/posts/:id` - Update blog post (author only)
- `DELETE /api/posts/:id` - Delete blog post (author only)
- `POST /api/posts/:id/like` - Like/unlike a post (authenticated)

### Comments Routes
- `GET /api/posts/:postId/comments` - Get comments for a post
- `POST /api/posts/:postId/comments` - Add comment to post (authenticated)
- `DELETE /api/comments/:id` - Delete comment (author only)

### AI Integration Routes (Bonus)
- `POST /api/ai/suggest-title` - Generate blog title suggestions
- `POST /api/ai/suggest-content` - Generate blog content ideas
- `POST /api/ai/improve-content` - Improve existing content

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── ui/                 # Shadcn/ui components
│   ├── layout/            # Layout components
│   ├── auth/              # Authentication components
│   ├── blog/              # Blog-related components
│   └── common/            # Shared components
├── pages/                 # Page components
├── hooks/                 # Custom React hooks
├── store/                 # Redux store configuration
├── services/              # API service functions
├── utils/                 # Utility functions
└── types/                 # TypeScript type definitions
```

### State Management
- **Authentication State**: User login status, user data
- **Blog State**: Posts list, current post, loading states
- **UI State**: Modals, notifications, theme

### Routing Structure
- `/` - Home page (blog posts list)
- `/login` - Login page
- `/register` - Registration page
- `/post/:id` - Individual blog post view
- `/create` - Create new post (authenticated)
- `/edit/:id` - Edit post (author only)
- `/profile` - User profile (authenticated)

## Security Considerations

### Authentication
- JWT tokens stored in httpOnly cookies
- Token expiration and refresh mechanism
- Password strength requirements
- Rate limiting on auth endpoints

### Data Validation
- Input sanitization on both frontend and backend
- Schema validation using Zod (frontend) and express-validator (backend)
- XSS protection
- SQL injection prevention (using ODM)

### Authorization
- Route protection middleware
- Resource ownership verification
- Role-based access control

## Performance Optimizations

### Frontend
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Memoization with React.memo and useMemo
- Virtual scrolling for large lists

### Backend
- Database indexing on frequently queried fields
- Response caching for static content
- Pagination for large datasets
- Connection pooling

## Deployment Strategy

### Frontend
- Build optimization with Vite/Create React App
- Static file hosting (Netlify/Vercel)
- Environment-specific configurations

### Backend
- Containerization with Docker
- Cloud deployment (Heroku/Railway)
- Environment variables for sensitive data
- Database hosting (MongoDB Atlas)

## Development Workflow

### Git Strategy
- Feature branch workflow
- Meaningful commit messages
- Pull request reviews
- Automated testing on CI/CD

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API endpoints
- Component testing for React components
- End-to-end testing for critical user flows

## Bonus Features Implementation

### AI Integration
- OpenAI API integration for content suggestions
- Fallback to mock responses if API unavailable
- Rate limiting for AI requests
- Content moderation for AI-generated content

### Additional Features
- Rich text editor for blog posts
- Image upload and management
- Search functionality
- Email notifications
- Social media sharing
- SEO optimization

This architecture provides a solid foundation for building a scalable, maintainable blog application that meets all the specified requirements while allowing for future enhancements.

