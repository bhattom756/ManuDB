# 🚀 Full Render Deployment Guide

This guide will help you deploy your entire Manufacturing Management System to Render.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Environment Variables**: Prepare your production environment variables

## 🛠 Deployment Steps

### Step 1: Deploy PostgreSQL Database

1. Go to your Render dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `manufacturing-db`
   - **Database**: `manufacturing_db`
   - **User**: `manufacturing_user`
   - **Plan**: Starter (Free tier available)
4. Click "Create Database"
5. **Save the connection string** - you'll need it for the backend

### Step 2: Deploy Backend (Web Service)

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `manufacturing-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Starter (Free tier available)

4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your-postgres-connection-string>
   JWT_SECRET=<generate-a-strong-secret>
   CORS_ORIGIN=https://manufacturing-frontend.onrender.com
   SENDGRID_API_KEY=<your-sendgrid-key>
   ```

5. Click "Create Web Service"

### Step 3: Deploy Frontend (Static Site)

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `manufacturing-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://manufacturing-backend.onrender.com
   ```

5. Click "Create Static Site"

### Step 4: Update CORS Origin

After both services are deployed:

1. Go to your backend service settings
2. Update the `CORS_ORIGIN` environment variable to your actual frontend URL
3. Redeploy the backend service

## 🔧 Environment Variables Reference

### Backend Environment Variables:
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://manufacturing_user:password@dpg-xxx.oregon-postgres.render.com/manufacturing_db
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=https://manufacturing-frontend.onrender.com
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Frontend Environment Variables:
```env
VITE_API_URL=https://manufacturing-backend.onrender.com
```

## 🚨 Important Notes

1. **Free Tier Limitations**:
   - Services sleep after 15 minutes of inactivity
   - Cold start takes ~30 seconds
   - Limited to 750 hours/month

2. **Database Setup**:
   - The database will be automatically set up on first deployment
   - Admin user seeding happens automatically

3. **SSL Certificates**:
   - Automatically provided by Render
   - All URLs use HTTPS

4. **Custom Domains**:
   - Available on paid plans
   - Can be configured in service settings

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Ensure `CORS_ORIGIN` matches your frontend URL exactly
   - Check for trailing slashes

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` is correct
   - Check if database service is running

3. **Build Failures**:
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json

4. **Environment Variables**:
   - All variables must be set in Render dashboard
   - Redeploy after changing environment variables

## 📊 Monitoring

- **Logs**: Available in Render dashboard for each service
- **Metrics**: Basic metrics available on free tier
- **Health Checks**: Automatic health monitoring

## 🔄 Updates and Redeployment

- **Automatic**: Push to your main branch triggers automatic deployment
- **Manual**: Use "Manual Deploy" in Render dashboard
- **Rollback**: Available in deployment history

## 💰 Cost Estimation

**Free Tier** (Suitable for development/testing):
- Web Service: Free (750 hours/month)
- Static Site: Free (unlimited)
- PostgreSQL: Free (1GB storage)

**Paid Plans** (For production):
- Web Service: $7/month (always on)
- Static Site: Free
- PostgreSQL: $7/month (1GB storage)

## 🎯 Next Steps

1. Test your deployed application
2. Set up monitoring and alerts
3. Configure custom domain (if needed)
4. Set up automated backups
5. Consider upgrading to paid plans for production use

## 📞 Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: For application-specific issues
