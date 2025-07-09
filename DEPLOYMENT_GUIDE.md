# BlogApp Deployment Guide

This guide provides step-by-step instructions for deploying the BlogApp to various cloud platforms and environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Deployment](#local-deployment)
- [Cloud Deployment](#cloud-deployment)
  - [Backend Deployment](#backend-deployment)
  - [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring and Logging](#monitoring-and-logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- MongoDB Atlas account (for cloud database)
- Git repository set up
- Cloud platform account (Heroku, Railway, Vercel, etc.)
- Domain name (optional, for custom domains)

## Environment Setup

### 1. Production Environment Variables

Create a `.env.production` file with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blogapp?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-production-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# AI Configuration (Optional)
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL=gpt-3.5-turbo

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com
```

### 2. Frontend Environment Configuration

Update the API URL in your frontend configuration:

```javascript
// frontend/blog-frontend/src/services/authService.js
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com/api'
  : 'http://localhost:5000/api';
```

## Local Deployment

### Using Docker (Recommended)

1. **Create Docker Compose file**:

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:5
    container_name: blogapp-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    container_name: blogapp-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/blogapp?authSource=admin
    depends_on:
      - mongodb
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend/blog-frontend
    container_name: blogapp-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
    depends_on:
      - backend

volumes:
  mongodb_data:
```

2. **Create Backend Dockerfile**:

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads

EXPOSE 5000

CMD ["npm", "start"]
```

3. **Create Frontend Dockerfile**:

```dockerfile
# frontend/blog-frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
```

4. **Deploy with Docker Compose**:

```bash
docker-compose up -d
```

## Cloud Deployment

### Backend Deployment

#### Option 1: Railway

1. **Install Railway CLI**:
```bash
npm install -g @railway/cli
```

2. **Login and Initialize**:
```bash
railway login
cd backend
railway init
```

3. **Set Environment Variables**:
```bash
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your-mongodb-atlas-uri
railway variables set JWT_SECRET=your-jwt-secret
```

4. **Deploy**:
```bash
railway up
```

#### Option 2: Heroku

1. **Install Heroku CLI and Login**:
```bash
heroku login
```

2. **Create Heroku App**:
```bash
cd backend
heroku create your-blogapp-backend
```

3. **Set Environment Variables**:
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-jwt-secret
```

4. **Deploy**:
```bash
git push heroku main
```

#### Option 3: AWS EC2

1. **Launch EC2 Instance**:
   - Choose Ubuntu 22.04 LTS
   - Configure security groups (ports 22, 80, 443, 5000)
   - Create or use existing key pair

2. **Connect and Setup**:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/yourusername/blog-app.git
cd blog-app/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
nano .env  # Edit with production values

# Start with PM2
pm2 start server.js --name "blogapp-backend"
pm2 startup
pm2 save
```

3. **Setup Nginx Reverse Proxy**:
```bash
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/blogapp

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/blogapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Frontend Deployment

#### Option 1: Vercel

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy**:
```bash
cd frontend/blog-frontend
vercel --prod
```

3. **Configure Environment Variables** in Vercel dashboard:
   - `VITE_API_URL`: Your backend URL

#### Option 2: Netlify

1. **Build the Project**:
```bash
cd frontend/blog-frontend
npm run build
```

2. **Deploy via Netlify CLI**:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

3. **Configure Environment Variables** in Netlify dashboard:
   - `VITE_API_URL`: Your backend URL

#### Option 3: AWS S3 + CloudFront

1. **Build the Project**:
```bash
cd frontend/blog-frontend
npm run build
```

2. **Create S3 Bucket**:
```bash
aws s3 mb s3://your-blogapp-frontend
```

3. **Upload Files**:
```bash
aws s3 sync dist/ s3://your-blogapp-frontend --delete
```

4. **Configure S3 for Static Website Hosting**:
```bash
aws s3 website s3://your-blogapp-frontend --index-document index.html --error-document index.html
```

5. **Setup CloudFront Distribution** (via AWS Console):
   - Origin: Your S3 bucket
   - Default Root Object: index.html
   - Error Pages: 404 -> /index.html (for SPA routing)

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**:
   - Go to https://www.mongodb.com/atlas
   - Create free tier cluster

2. **Configure Database**:
   - Create database user
   - Whitelist IP addresses (0.0.0.0/0 for development)
   - Get connection string

3. **Connection String Format**:
```
mongodb+srv://username:password@cluster.mongodb.net/blogapp?retryWrites=true&w=majority
```

### Self-Hosted MongoDB

1. **Install MongoDB**:
```bash
# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

2. **Start MongoDB**:
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

3. **Configure Security**:
```bash
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "securepassword",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | Database connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `MAX_FILE_SIZE` | Max upload size | `5242880` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://yourdomain.com` |

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

1. **Install Certbot**:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Obtain Certificate**:
```bash
sudo certbot --nginx -d your-domain.com
```

3. **Auto-renewal**:
```bash
sudo crontab -e
# Add line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Using Cloudflare (Recommended)

1. **Add Domain to Cloudflare**
2. **Update Nameservers**
3. **Enable SSL/TLS** (Full or Full Strict)
4. **Configure Page Rules** for caching

## Monitoring and Logging

### Application Monitoring

1. **PM2 Monitoring**:
```bash
pm2 monit
pm2 logs
```

2. **Log Rotation**:
```bash
pm2 install pm2-logrotate
```

### Health Checks

1. **Create Health Check Endpoint** (already implemented):
```javascript
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
```

2. **Setup Uptime Monitoring**:
   - Use services like UptimeRobot, Pingdom, or StatusCake
   - Monitor `/api/health` endpoint

### Error Tracking

1. **Sentry Integration**:
```bash
npm install @sentry/node
```

```javascript
// Add to server.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

## Performance Optimization

### Backend Optimization

1. **Enable Compression**:
```javascript
const compression = require('compression');
app.use(compression());
```

2. **Database Indexing**:
```javascript
// Add indexes to frequently queried fields
userSchema.index({ email: 1 });
postSchema.index({ author: 1, createdAt: -1 });
```

3. **Caching with Redis**:
```bash
npm install redis
```

```javascript
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
```

### Frontend Optimization

1. **Bundle Analysis**:
```bash
npm run build -- --analyze
```

2. **Code Splitting**:
```javascript
const LazyComponent = lazy(() => import('./Component'));
```

3. **Service Worker** (for PWA):
```bash
npm install workbox-webpack-plugin
```

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**: 
- Check CORS configuration in backend
- Verify frontend API URL
- Ensure proper environment variables

#### 2. Database Connection Issues
**Problem**: Cannot connect to MongoDB
**Solution**:
- Verify connection string
- Check network access (IP whitelist)
- Ensure database user has proper permissions

#### 3. JWT Token Issues
**Problem**: Authentication not working
**Solution**:
- Verify JWT_SECRET is set
- Check token expiration
- Ensure proper token format

#### 4. File Upload Issues
**Problem**: Images not uploading
**Solution**:
- Check file size limits
- Verify upload directory permissions
- Ensure multer configuration

### Debugging Commands

```bash
# Check application logs
pm2 logs blogapp-backend

# Check system resources
htop
df -h

# Check network connectivity
curl -I http://localhost:5000/api/health

# Check database connection
mongo "your-connection-string"

# Check environment variables
printenv | grep NODE_ENV
```

### Performance Monitoring

```bash
# Monitor application performance
pm2 monit

# Check memory usage
free -h

# Check disk usage
du -sh /path/to/app

# Monitor network traffic
netstat -tuln
```

## Security Checklist

- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] File upload restrictions in place
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Regular security updates
- [ ] Backup strategy implemented

## Backup Strategy

### Database Backup

```bash
# MongoDB Atlas - Automatic backups enabled by default

# Self-hosted MongoDB
mongodump --uri="mongodb://username:password@localhost:27017/blogapp" --out=/backup/$(date +%Y%m%d)
```

### Application Backup

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/blogapp_$DATE.tar.gz /path/to/app
```

### Automated Backups

```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer Setup**:
   - Use Nginx, HAProxy, or cloud load balancers
   - Configure health checks
   - Implement session affinity if needed

2. **Database Scaling**:
   - MongoDB replica sets
   - Read replicas for read-heavy workloads
   - Sharding for large datasets

3. **CDN Integration**:
   - CloudFront, CloudFlare, or similar
   - Cache static assets
   - Optimize image delivery

### Vertical Scaling

1. **Server Resources**:
   - Monitor CPU and memory usage
   - Scale server instances as needed
   - Optimize database queries

2. **Database Optimization**:
   - Index optimization
   - Query performance tuning
   - Connection pooling

This deployment guide provides comprehensive instructions for deploying the BlogApp to various environments. Choose the deployment strategy that best fits your requirements and infrastructure preferences.

