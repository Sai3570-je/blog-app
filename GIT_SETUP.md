# Git Repository Setup Guide

This guide provides instructions for setting up the BlogApp project in a Git repository with proper version control practices.

## Initial Repository Setup

### 1. Initialize Git Repository

```bash
cd blog-app
git init
```

### 2. Create .gitignore Files

#### Root .gitignore
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Build outputs
dist/
build/

# Uploads
uploads/
*.jpg
*.jpeg
*.png
*.gif
*.pdf
*.doc
*.docx

# Database
*.db
*.sqlite

# Temporary files
tmp/
temp/
```

#### Backend .gitignore
```gitignore
# Backend specific
uploads/
tests/coverage/
.nyc_output/
```

#### Frontend .gitignore
```gitignore
# Frontend specific
dist/
.vite/
```

### 3. Create README.md

The comprehensive README.md has already been created with all necessary information.

### 4. Add Files to Git

```bash
git add .
git commit -m "Initial commit: Complete BlogApp implementation

- Full-stack blog application with React + Node.js
- JWT authentication system
- CRUD operations for blog posts
- Comments and likes functionality
- AI-powered content suggestions
- Responsive design with Shadcn/ui
- Comprehensive API documentation
- Production-ready deployment configuration"
```

## GitHub Repository Setup

### 1. Create GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Repository name: `blog-app` or `fullstack-blog-application`
4. Description: "A modern full-stack blog application built with React, Node.js, Express, and MongoDB"
5. Choose Public or Private
6. Don't initialize with README (we already have one)
7. Click "Create repository"

### 2. Connect Local Repository to GitHub

```bash
git remote add origin https://github.com/yourusername/blog-app.git
git branch -M main
git push -u origin main
```

### 3. Repository Structure

```
blog-app/
├── .gitignore
├── README.md
├── PROJECT_WRITEUP.md
├── DEPLOYMENT_GUIDE.md
├── GIT_SETUP.md
├── todo.md
├── backend/
│   ├── .gitignore
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   └── utils/
├── frontend/
│   └── blog-frontend/
│       ├── .gitignore
│       ├── package.json
│       ├── index.html
│       ├── vite.config.js
│       ├── public/
│       └── src/
└── docs/
    └── architecture.md
```

## Branch Strategy

### 1. Main Branch Protection

Set up branch protection rules on GitHub:

1. Go to Settings > Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date
   - Include administrators

### 2. Development Workflow

```bash
# Create feature branch
git checkout -b feature/user-authentication
git checkout -b feature/blog-posts
git checkout -b feature/ai-integration

# Work on feature
git add .
git commit -m "Add user authentication system"

# Push feature branch
git push origin feature/user-authentication

# Create pull request on GitHub
# After review and approval, merge to main
```

### 3. Release Strategy

```bash
# Create release branch
git checkout -b release/v1.0.0

# Final testing and bug fixes
git commit -m "Fix: Minor UI adjustments for release"

# Merge to main
git checkout main
git merge release/v1.0.0

# Tag release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Commit Message Conventions

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
git commit -m "feat(auth): implement JWT authentication system"
git commit -m "fix(posts): resolve post creation validation issue"
git commit -m "docs: update API documentation"
git commit -m "style(frontend): improve responsive design"
git commit -m "refactor(backend): optimize database queries"
git commit -m "test(api): add comprehensive API tests"
git commit -m "chore(deps): update dependencies to latest versions"
```

## GitHub Features Setup

### 1. Issues and Project Management

Create issue templates:

#### Bug Report Template
```markdown
---
name: Bug report
about: Create a report to help us improve
title: ''
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

#### Feature Request Template
```markdown
---
name: Feature request
about: Suggest an idea for this project
title: ''
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### 2. GitHub Actions (CI/CD)

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:5
        ports:
          - 27017:27017
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
    
    - name: Install backend dependencies
      run: |
        cd backend
        npm ci
    
    - name: Run backend tests
      run: |
        cd backend
        npm test
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://localhost:27017/blogapp_test
        JWT_SECRET: test-secret

  test-frontend:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/blog-frontend/package-lock.json
    
    - name: Install frontend dependencies
      run: |
        cd frontend/blog-frontend
        npm ci
    
    - name: Build frontend
      run: |
        cd frontend/blog-frontend
        npm run build
    
    - name: Run frontend tests
      run: |
        cd frontend/blog-frontend
        npm test

  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        echo "Deploy to production server"
        # Add your deployment commands here
```

### 3. Security

#### Dependabot Configuration

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    
  - package-ecosystem: "npm"
    directory: "/frontend/blog-frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

#### Security Policy

Create `SECURITY.md`:

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please send an email to security@yourdomain.com.

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and provide a timeline for fixes.
```

## Repository Documentation

### 1. Contributing Guidelines

Create `CONTRIBUTING.md`:

```markdown
# Contributing to BlogApp

Thank you for your interest in contributing to BlogApp!

## Development Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Submit a pull request

## Code Style

- Use ESLint and Prettier configurations
- Follow existing code patterns
- Write meaningful commit messages
- Add comments for complex logic

## Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for good test coverage

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure CI passes
4. Request review from maintainers
```

### 2. License

Create `LICENSE`:

```
MIT License

Copyright (c) 2024 BlogApp

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Repository Maintenance

### 1. Regular Tasks

- Update dependencies monthly
- Review and merge dependabot PRs
- Monitor security alerts
- Update documentation as needed
- Tag releases regularly

### 2. Release Process

```bash
# 1. Update version in package.json files
npm version patch  # or minor, major

# 2. Update CHANGELOG.md
# 3. Create release branch
git checkout -b release/v1.0.1

# 4. Final testing
# 5. Merge to main
git checkout main
git merge release/v1.0.1

# 6. Tag release
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1

# 7. Create GitHub release with release notes
```

### 3. Monitoring

- Set up GitHub notifications
- Monitor repository insights
- Track issues and PRs
- Review security advisories

This Git setup guide ensures proper version control, collaboration, and maintenance of the BlogApp repository.

