# 🚂 Railway Docker Deployment Guide

This guide covers deploying your Manufacturing Management System using Docker containers on Railway.

## 🎯 **Why Railway?**

### **Advantages:**
- ✅ **Free Tier Available** - $5 credit monthly (enough for small apps)
- ✅ **Excellent Docker Support** - Native Dockerfile deployment
- ✅ **PostgreSQL Included** - Managed database service
- ✅ **Automatic Deployments** - Git push triggers deployment
- ✅ **Environment Variables** - Easy configuration management
- ✅ **Custom Domains** - Free custom domain support
- ✅ **No Credit Card Required** - For free tier

### **Railway vs Render:**
| Feature | Railway | Render |
|---------|---------|--------|
| **Free Tier** | $5 credit/month | 750 hours/month |
| **Docker Support** | ✅ Native | ✅ Native |
| **PostgreSQL** | ✅ Included | ✅ Separate service |
| **Blueprints** | ✅ Free | ❌ Paid |
| **Custom Domains** | ✅ Free | ✅ Free |

## 🏗 **Architecture Overview**

```
┌─────────────────────────────────────┐
│           Railway Platform          │
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

## 📋 **Deployment Steps**

### **Step 1: Prepare Your Repository**

1. **Ensure all files are committed:**
   ```bash
   git add .
   git commit -m "Add Railway Docker configuration"
   git push origin main
   ```

2. **Verify these files exist:**
   - ✅ `Dockerfile` (or `Dockerfile.railway`)
   - ✅ `railway.json`
   - ✅ `backend/` directory
   - ✅ `frontend/` directory

### **Step 2: Deploy to Railway**

#### **Method A: Using Railway CLI (Recommended)**

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize Railway project:**
   ```bash
   railway init
   ```

4. **Add PostgreSQL database:**
   ```bash
   railway add postgresql
   ```

5. **Deploy your app:**
   ```bash
   railway up
   ```

#### **Method B: Using Railway Dashboard**

1. **Go to [railway.app](https://railway.app)** and sign in
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository** (Management DB)
5. **Railway will automatically:**
   - Detect your Dockerfile
   - Create PostgreSQL database
   - Deploy your container

### **Step 3: Configure Environment Variables**

After deployment, set these environment variables in Railway dashboard:

#### **Required Variables:**
```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=https://your-app-name.railway.app
```

#### **Database Variables (Auto-generated):**
```env
DATABASE_URL=postgresql://postgres:password@host:port/database
```

#### **Optional Variables:**
```env
SENDGRID_API_KEY=your-sendgrid-api-key
```

### **Step 4: Set Up Custom Domain (Optional)**

1. **Go to your project settings**
2. **Click "Domains"**
3. **Add your custom domain**
4. **Update DNS records** as instructed

## 🔧 **Local Development with Railway**

### **Using Railway CLI:**
```bash
# Connect to your Railway project
railway link

# Run locally with Railway environment
railway run npm run dev

# View logs
railway logs

# Open database console
railway connect postgresql
```

### **Using Docker Compose:**
```bash
# Production-like environment
docker-compose up --build

# Development environment
docker-compose -f docker-compose.dev.yml up --build
```

## 🐳 **Docker Configuration**

### **Railway-Specific Optimizations:**

1. **Port Configuration:**
   - Railway sets `PORT` environment variable automatically
   - Your app should use `process.env.PORT || 5000`

2. **Health Checks:**
   - Railway automatically monitors your app
   - Health check endpoint: `/api/health`

3. **Build Optimization:**
   - Multi-stage builds for smaller images
   - Alpine Linux for security and size

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **Build Failures:**
   ```bash
   # Check build logs in Railway dashboard
   # Or use CLI:
   railway logs
   ```

2. **Database Connection Issues:**
   - Verify `DATABASE_URL` is set correctly
   - Check if PostgreSQL service is running
   - Ensure database is accessible

3. **Environment Variables:**
   - All variables must be set in Railway dashboard
   - Redeploy after changing environment variables

4. **Port Issues:**
   - Railway sets PORT automatically
   - Don't hardcode port numbers

### **Debug Commands:**
```bash
# View real-time logs
railway logs --follow

# Connect to database
railway connect postgresql

# Run shell in container
railway shell

# Check environment variables
railway variables
```

## 📊 **Performance and Scaling**

### **Railway Features:**
- **Auto-scaling**: Automatic scaling based on traffic
- **Health monitoring**: Automatic restart on failures
- **Log aggregation**: Centralized logging
- **Metrics**: Built-in performance monitoring

### **Optimization Tips:**
- Use multi-stage Docker builds
- Implement proper health checks
- Optimize database queries
- Use connection pooling

## 💰 **Pricing**

### **Free Tier:**
- **$5 credit monthly**
- **Enough for small applications**
- **PostgreSQL included**
- **Custom domains free**

### **Paid Plans:**
- **Developer**: $5/month + usage
- **Team**: $20/month + usage
- **Enterprise**: Custom pricing

### **Cost Estimation:**
- **Small app**: Free tier sufficient
- **Medium app**: ~$10-20/month
- **Large app**: Custom pricing

## 🔄 **CI/CD with Railway**

### **Automatic Deployments:**
- Push to main branch triggers deployment
- Preview deployments for pull requests
- Rollback to previous versions

### **GitHub Actions Integration:**
```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: railwayapp/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

## 🎯 **Next Steps**

1. **Deploy to Railway** using the provided configuration
2. **Test the deployment** thoroughly
3. **Set up monitoring** and alerts
4. **Configure custom domain** (if needed)
5. **Set up CI/CD pipeline** for automated deployments

## 📞 **Support Resources**

- **Railway Documentation**: https://docs.railway.app/
- **Railway Community**: https://discord.gg/railway
- **GitHub Repository**: Your project repository
- **Railway Status**: https://status.railway.app/

---

**🎉 Your Railway deployment is ready!** Railway provides an excellent balance of features, performance, and cost-effectiveness for your Manufacturing Management System.
