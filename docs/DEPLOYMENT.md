# Deployment Guide - Prompter AI

This guide covers deploying the Prompter AI full-stack application to production.

## 🚀 Quick Start

### 1. Backend Deployment (Railway/Heroku)

#### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy backend
cd backend
railway init
railway up
```

#### Heroku Deployment
```bash
# Install Heroku CLI
# Create new app
heroku create prompter-ai-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set OPENAI_API_KEY=your_key
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_key

# Deploy
git subtree push --prefix backend heroku main
```

### 2. Web Application Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy web app
cd web
vercel --prod

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_BACKEND_URL=your_backend_url
```

### 3. Chrome Extension Distribution

#### Chrome Web Store
1. Package extension folder into ZIP
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
3. Upload ZIP file
4. Fill out store listing details
5. Submit for review

#### Private Distribution
1. Package extension folder
2. Distribute ZIP file to users
3. Users load via "Load unpacked" in Chrome

## 🔧 Environment Configuration

### Backend Environment Variables
```env
# Production
NODE_ENV=production
PORT=3000

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,chrome-extension://*

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Quotas
FREE_TRIAL_LIMIT=10
PRO_PLAN_LIMIT=1000

# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=https://yourdomain.com
```

### Web App Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Backend
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🗄️ Database Setup

### Supabase Configuration
1. Create new Supabase project
2. Run SQL schema from `backend/supabase-schema.sql`
3. Enable Google OAuth in Auth settings
4. Configure OAuth redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `chrome-extension://your-extension-id`

### Database Security
- Enable Row Level Security (RLS)
- Configure policies for user data access
- Set up proper indexes for performance

## 💳 Payment Integration

### Stripe Setup
1. Create Stripe account
2. Get API keys from dashboard
3. Create products and prices for Pro plan
4. Configure webhook endpoints:
   - `https://your-backend.railway.app/api/webhooks/stripe`
5. Set webhook events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## 🔒 Security Configuration

### CORS Settings
```javascript
// Backend CORS configuration
const corsOptions = {
  origin: [
    'https://yourdomain.com',
    'chrome-extension://your-extension-id'
  ],
  credentials: true
};
```

### Rate Limiting
```javascript
// Production rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: 'Too many requests'
});
```

### Security Headers
```javascript
// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## 📊 Monitoring & Logging

### Application Monitoring
- Set up error tracking (Sentry)
- Monitor API response times
- Track user usage patterns
- Set up alerts for quota limits

### Logging Configuration
```javascript
// Production logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🚀 Performance Optimization

### Backend Optimization
- Enable gzip compression
- Implement Redis caching for frequent requests
- Optimize database queries
- Use connection pooling

### Frontend Optimization
- Enable Next.js production optimizations
- Implement image optimization
- Use CDN for static assets
- Enable service worker caching

### Extension Optimization
- Minimize bundle size
- Implement lazy loading
- Use efficient storage patterns
- Optimize content script performance

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          cd backend
          railway up --service backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          cd web
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 🧪 Testing in Production

### Health Checks
```javascript
// Backend health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      openai: !!openai,
      supabase: !!supabase,
      stripe: !!process.env.STRIPE_SECRET_KEY
    }
  });
});
```

### Smoke Tests
1. Test extension installation
2. Verify authentication flow
3. Test prompt optimization
4. Check quota enforcement
5. Verify payment processing

## 📈 Scaling Considerations

### Backend Scaling
- Use load balancers for multiple instances
- Implement horizontal scaling
- Use Redis for session storage
- Consider microservices architecture

### Database Scaling
- Set up read replicas
- Implement connection pooling
- Use database indexing
- Consider sharding for large datasets

### Extension Scaling
- Implement efficient content script loading
- Use message passing for communication
- Optimize storage usage
- Handle multiple tabs efficiently

## 🆘 Troubleshooting

### Common Issues
1. **CORS errors**: Check allowed origins configuration
2. **Authentication failures**: Verify Supabase configuration
3. **Rate limiting**: Adjust limits based on usage patterns
4. **Payment failures**: Check Stripe webhook configuration
5. **Extension not loading**: Verify manifest permissions

### Debug Mode
```javascript
// Enable debug logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
```

## 📋 Pre-Launch Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Authentication working
- [ ] Payment integration tested
- [ ] Extension loads in Chrome
- [ ] API endpoints responding
- [ ] Error handling implemented
- [ ] Monitoring configured
- [ ] Security headers set
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] SSL certificates valid
- [ ] Backup procedures in place
- [ ] Documentation updated

## 🎯 Post-Launch

### Monitoring
- Track user registrations
- Monitor API usage
- Watch for errors
- Track conversion rates

### Maintenance
- Regular security updates
- Database maintenance
- Performance optimization
- Feature updates

---

**Ready to launch Prompter AI!** 🚀
