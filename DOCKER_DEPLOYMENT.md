# 🐳 Docker Deployment Guide for Render

This guide covers deploying your Manufacturing Management System using Docker containers on Render.

## 🎯 **Why Docker on Render?**

### **Advantages:**
- **Single Container**: Frontend + Backend in one deployment
- **Consistent Environment**: Same environment across dev/staging/prod
- **Easy Scaling**: Horizontal scaling with load balancers
- **Version Control**: Container images are versioned
- **Isolation**: Complete application isolation

### **Render Docker Support:**
- ✅ **Dockerfile Support**: Native Dockerfile deployment
- ✅ **Multi-stage Builds**: Optimized production images
- ✅ **Health Checks**: Built-in container health monitoring
- ✅ **Environment Variables**: Easy configuration management
- ✅ **Auto-scaling**: Automatic scaling based on traffic

## 🏗 **Architecture Overview**

```
┌─────────────────────────────────────┐
│           Render Platform           │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │     Docker Container            ││
│  │  ┌─────────────┐ ┌─────────────┐││
│  │  │   Frontend  │ │   Backend   │││
│  │  │   (React)   │ │  (Express)  │││
│  │  └─────────────┘ └─────────────┘││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │     PostgreSQL Database         ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

## 🚀 **Deployment Options**

### **Option 1: Single Container (Recommended)**
- **Frontend + Backend** in one Docker container
- **Simpler deployment** and management
- **Lower cost** (one service instead of two)
- **Better performance** (no network latency between services)

### **Option 2: Multi-Container**
- **Separate containers** for frontend and backend
- **Independent scaling** of services
- **More complex** but more flexible

## 📋 **Deployment Steps**

### **Step 1: Prepare Your Repository**

1. **Ensure all files are committed:**
   ```bash
   git add .
   git commit -m "Add Docker configuration"
   git push origin main
   ```

2. **Verify Dockerfile exists** in your root directory

### **Step 2: Deploy to Render**

#### **Method A: Using render.yaml (Recommended)**

1. **Connect GitHub Repository:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select your repository

2. **Render will automatically:**
   - Detect the `render.yaml` file
   - Create PostgreSQL database
   - Build and deploy Docker container
   - Set up environment variables

#### **Method B: Manual Setup**

1. **Create PostgreSQL Database:**
   - Click "New +" → "PostgreSQL"
   - Name: `manufacturing-db`
   - Plan: Starter (Free)
   - Click "Create Database"

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Configure:
     - **Name**: `manufacturing-app`
     - **Environment**: `Docker`
     - **Dockerfile Path**: `./Dockerfile`
     - **Plan**: Starter (Free)

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<from-postgres-service>
   JWT_SECRET=<generate-strong-secret>
   CORS_ORIGIN=https://manufacturing-app.onrender.com
   SENDGRID_API_KEY=<your-sendgrid-key>
   ```

## 🔧 **Local Development with Docker**

### **Production-like Environment:**
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access your app at http://localhost:5000
```

### **Development Environment:**
```bash
# Run with development Docker Compose
docker-compose -f docker-compose.dev.yml up --build

# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

### **Individual Services:**
```bash
# Run only database
docker-compose up postgres

# Run only backend
docker-compose up backend

# Run only frontend
docker-compose up frontend
```

## 🐳 **Docker Commands Reference**

### **Build and Test Locally:**
```bash
# Build the Docker image
docker build -t manufacturing-app .

# Run the container
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  manufacturing-app

# Test the container
curl http://localhost:5000/api/health
```

### **Docker Compose Commands:**
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Execute commands in container
docker-compose exec app bash
```

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **Build Failures:**
   ```bash
   # Check Docker build locally
   docker build -t test-app .
   
   # Check build logs in Render dashboard
   ```

2. **Database Connection Issues:**
   - Verify `DATABASE_URL` environment variable
   - Check if database service is running
   - Ensure database is accessible from container

3. **Frontend Not Loading:**
   - Check if frontend build completed successfully
   - Verify static file serving in backend
   - Check browser console for errors

4. **Health Check Failures:**
   - Ensure `/api/health` endpoint exists
   - Check if application starts successfully
   - Verify port configuration

### **Debug Commands:**
```bash
# Check container logs
docker logs <container-id>

# Access container shell
docker exec -it <container-id> sh

# Check environment variables
docker exec <container-id> env

# Test database connection
docker exec <container-id> node -e "
const db = require('./backend/src/config/database');
db.query('SELECT NOW()').then(console.log);
"
```

## 📊 **Performance Optimization**

### **Docker Image Optimization:**
- ✅ **Multi-stage builds** (already implemented)
- ✅ **Alpine Linux** base images
- ✅ **Non-root user** for security
- ✅ **Health checks** for monitoring

### **Render Optimizations:**
- **Auto-scaling**: Configure based on CPU/memory usage
- **Health checks**: Automatic restart on failures
- **Logging**: Centralized log management
- **Monitoring**: Built-in metrics and alerts

## 💰 **Cost Comparison**

### **Docker vs Traditional Deployment:**

| Service | Traditional | Docker |
|---------|-------------|--------|
| Web Service | $7/month | $7/month |
| Static Site | Free | Included |
| Database | $7/month | $7/month |
| **Total** | **$14/month** | **$14/month** |

### **Free Tier Limitations:**
- Services sleep after 15 minutes of inactivity
- Cold start takes ~30 seconds
- Limited to 750 hours/month

## 🔄 **CI/CD with Docker**

### **GitHub Actions Example:**
```yaml
name: Deploy to Render
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

## 🎯 **Next Steps**

1. **Deploy to Render** using the provided configuration
2. **Test the deployment** thoroughly
3. **Set up monitoring** and alerts
4. **Configure custom domain** (if needed)
5. **Set up CI/CD pipeline** for automated deployments

## 📞 **Support Resources**

- **Render Docker Docs**: https://render.com/docs/docker
- **Docker Documentation**: https://docs.docker.com/
- **GitHub Repository**: Your project repository
- **Render Community**: https://community.render.com

---

**🎉 Your Docker deployment is ready!** The single container approach provides the best balance of simplicity, performance, and cost-effectiveness for your Manufacturing Management System.
