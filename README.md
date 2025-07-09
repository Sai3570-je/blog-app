# BlogApp - Full Stack Blog Application

A modern, full-featured blog application built with React, Node.js, Express, and MongoDB. This project demonstrates a complete full-stack implementation with authentication, CRUD operations, real-time features, and AI-powered content suggestions.

## 🚀 Live Demo

- **Frontend**: [Coming Soon - Deployment Link]
- **Backend API**: [Coming Soon - API Documentation]
- **API Documentation**: Available at `/api-docs` when running locally

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features (Must-Have)

#### Authentication
- ✅ User registration with email verification
- ✅ Secure login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Protected routes and middleware
- ✅ User profile management

#### Blog Posts
- ✅ Create blog posts with title, content, and optional images
- ✅ Rich text editing with Markdown support
- ✅ Edit and delete own posts
- ✅ View list of all blog posts
- ✅ View detailed blog post with full content
- ✅ Post categorization with tags
- ✅ Featured image support

#### Comments System
- ✅ Comment on any blog post (authenticated users)
- ✅ Delete own comments
- ✅ Nested comment structure
- ✅ Real-time comment updates

#### Likes System
- ✅ Like/unlike posts (authenticated users)
- ✅ Like count visible on each post
- ✅ Real-time like updates

### Bonus Features (Optional)

#### AI Integration
- ✅ AI-powered blog title suggestions
- ✅ AI-powered content ideas generation
- ✅ Mock AI implementation (easily replaceable with OpenAI API)
- ✅ Content improvement suggestions

#### Additional Features
- ✅ Responsive design for all devices
- ✅ Search functionality
- ✅ Post filtering and sorting
- ✅ User profiles with post history
- ✅ Image upload support
- ✅ SEO-friendly URLs
- ✅ Loading states and error handling
- ✅ Toast notifications

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **UI Library**: Shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Toastify

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **File Upload**: Multer
- **Security**: Helmet, CORS
- **Rate Limiting**: express-rate-limit
- **API Documentation**: Swagger/OpenAPI

### Development Tools
- **Package Manager**: pnpm (frontend), npm (backend)
- **Development Server**: Vite (frontend), Nodemon (backend)
- **Environment Variables**: dotenv
- **Code Quality**: ESLint, Prettier (configured)

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (v5 or higher)
- **pnpm** (for frontend) - `npm install -g pnpm`
- **Git** (for version control)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/blog-app.git
cd blog-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend/blog-frontend

# Install dependencies
pnpm install
```

### 4. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB service (Ubuntu/Debian)
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blogapp

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# AI Configuration (Optional)
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-3.5-turbo
```

### Frontend Configuration

The frontend automatically connects to the backend at `http://localhost:5000`. If you need to change this, update the API base URL in:

```javascript
// frontend/blog-frontend/src/services/authService.js
const API_URL = 'http://localhost:5000/api';
```

## 🚀 Running the Application

### Development Mode

#### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start at `http://localhost:5000`

#### 2. Start the Frontend Development Server

```bash
cd frontend/blog-frontend
pnpm run dev
```

The frontend will start at `http://localhost:5173`

#### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs

### Production Mode

#### Backend

```bash
cd backend
npm start
```

#### Frontend

```bash
cd frontend/blog-frontend
pnpm run build
pnpm run preview
```

## 📚 API Documentation

The API documentation is automatically generated using Swagger/OpenAPI and is available at:

```
http://localhost:5000/api-docs
```

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### Blog Posts
- `GET /api/posts` - Get all posts (with pagination)
- `POST /api/posts` - Create new post (authenticated)
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id` - Update post (authenticated, owner only)
- `DELETE /api/posts/:id` - Delete post (authenticated, owner only)
- `POST /api/posts/:id/like` - Like/unlike post (authenticated)

#### Comments
- `GET /api/comments/post/:postId` - Get comments for a post
- `POST /api/comments` - Create new comment (authenticated)
- `DELETE /api/comments/:id` - Delete comment (authenticated, owner only)

#### AI Integration
- `POST /api/ai/suggest-title` - Get AI title suggestions (authenticated)
- `POST /api/ai/suggest-content` - Get AI content ideas (authenticated)

## 📁 Project Structure

```
blog-app/
├── backend/                    # Node.js/Express backend
│   ├── controllers/           # Route controllers
│   ├── middleware/           # Custom middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── uploads/             # File uploads directory
│   ├── utils/               # Utility functions
│   ├── .env.example         # Environment variables template
│   ├── package.json         # Backend dependencies
│   └── server.js           # Main server file
├── frontend/                  # React frontend
│   └── blog-frontend/        # React application
│       ├── public/          # Static assets
│       ├── src/             # Source code
│       │   ├── components/  # React components
│       │   │   ├── auth/    # Authentication components
│       │   │   ├── blog/    # Blog-related components
│       │   │   ├── common/  # Shared components
│       │   │   ├── layout/  # Layout components
│       │   │   └── ui/      # Shadcn/ui components
│       │   ├── contexts/    # React contexts
│       │   ├── pages/       # Page components
│       │   ├── services/    # API services
│       │   ├── store/       # Redux store
│       │   │   └── slices/  # Redux slices
│       │   └── utils/       # Utility functions
│       ├── package.json     # Frontend dependencies
│       └── vite.config.js   # Vite configuration
├── docs/                     # Project documentation
│   └── architecture.md      # System architecture
├── README.md                # This file
└── todo.md                  # Development progress
```

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend/blog-frontend
pnpm test
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Create, edit, and delete blog posts
- [ ] Comment on posts
- [ ] Like/unlike posts
- [ ] Search functionality
- [ ] Responsive design on mobile devices
- [ ] AI content suggestions
- [ ] File upload functionality

## 🚀 Deployment

### Backend Deployment

The backend can be deployed to various platforms:

#### Heroku
```bash
# Install Heroku CLI and login
heroku create your-blog-app-backend
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-production-jwt-secret
git push heroku main
```

#### Railway
```bash
# Connect to Railway and deploy
railway login
railway init
railway add
railway deploy
```

### Frontend Deployment

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel
cd frontend/blog-frontend
vercel --prod
```

#### Netlify
```bash
# Build the project
pnpm run build

# Deploy to Netlify (drag and drop dist folder)
# Or use Netlify CLI
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Environment Variables for Production

Make sure to set the following environment variables in your production environment:

- `NODE_ENV=production`
- `MONGODB_URI` (MongoDB Atlas connection string)
- `JWT_SECRET` (strong, unique secret)
- `OPENAI_API_KEY` (if using real AI features)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide](https://lucide.dev/) for the icon library
- [MongoDB](https://www.mongodb.com/) for the database
- [Express.js](https://expressjs.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend framework

## 📞 Support

If you have any questions or need help with the project, please:

1. Check the [API Documentation](http://localhost:5000/api-docs)
2. Review the [Project Structure](#project-structure)
3. Open an issue on GitHub
4. Contact the development team

---

**Built with ❤️ by SAI PANINDRA

