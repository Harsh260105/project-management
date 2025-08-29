# AWS Deployment Guide

This guide covers deploying the Project Management application to AWS.

## Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js 18+ and npm
- Docker (for containerized deployment)

## Environment Variables

Create a `.env.local` file in the client directory with:

```bash
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_cognito_user_pool_id
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=your_cognito_client_id
NEXT_PUBLIC_API_BASE_URL=https://your-api-gateway-url.amazonaws.com
```

## Deployment Options

### Option 1: AWS Amplify (Recommended for Frontend)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub/GitLab/Bitbucket
   git push origin main
   ```

2. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Set Environment Variables** in AWS Amplify Console

### Option 2: AWS ECS with Fargate

1. **Build Docker Image**
   ```bash
   # Make deployment script executable
   chmod +x scripts/deploy.sh
   
   # Run deployment script
   ./scripts/deploy.sh
   ```

2. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json* ./
   RUN npm ci --only=production
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build
   
   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   ENV HOSTNAME "0.0.0.0"
   
   CMD ["node", "server.js"]
   ```

3. **Deploy to ECS**
   ```bash
   # Build and push to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
   
   docker build -t project-management-app .
   docker tag project-management-app:latest your-account.dkr.ecr.us-east-1.amazonaws.com/project-management-app:latest
   docker push your-account.dkr.ecr.us-east-1.amazonaws.com/project-management-app:latest
   ```

### Option 3: AWS S3 + CloudFront (Static Hosting)

1. **Build and Export**
   ```bash
   npm run build
   npm run export
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync out/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront**
   - Origin: S3 bucket
   - Behaviors: Cache based on file extension
   - Error pages: Redirect 404 to /index.html

## Security Considerations

### Cognito Configuration
- Enable MFA for production users
- Set appropriate password policies
- Configure user pool triggers for additional security

### API Gateway
- Enable CORS for your domain
- Use API keys or JWT authorizers
- Set rate limiting

### Environment Variables
- Never commit `.env` files to version control
- Use AWS Systems Manager Parameter Store for sensitive values
- Rotate secrets regularly

## Monitoring and Logging

### CloudWatch
- Set up log groups for application logs
- Create dashboards for key metrics
- Set up alarms for errors and performance issues

### Application Performance Monitoring
- Consider using AWS X-Ray for tracing
- Implement structured logging
- Monitor API response times

## Backup and Recovery

### Database
- Enable automated backups for RDS
- Test restore procedures regularly
- Document recovery processes

### Application
- Use version control for code
- Tag releases for easy rollback
- Test deployment rollback procedures

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Check `.env.local` file exists
   - Verify variable names match exactly
   - Restart development server

2. **Cognito Authentication Fails**
   - Verify user pool and client IDs
   - Check CORS settings
   - Verify domain configuration

3. **API Calls Failing**
   - Check API Gateway configuration
   - Verify CORS settings
   - Check authentication headers

### Debug Mode

Enable debug logging in development:
```bash
# Set in .env.local
NEXT_PUBLIC_DEBUG=true
```

## Performance Optimization

### Build Optimization
- Use `npm ci` instead of `npm install`
- Enable tree shaking
- Optimize bundle splitting

### Runtime Optimization
- Implement lazy loading for components
- Use React.memo for expensive components
- Optimize image loading

## Cost Optimization

### S3
- Use appropriate storage classes
- Implement lifecycle policies
- Monitor data transfer costs

### ECS/Fargate
- Right-size container resources
- Use spot instances for non-critical workloads
- Monitor CPU and memory usage

## Support

For deployment issues:
1. Check CloudWatch logs
2. Verify environment variables
3. Test locally with production config
4. Review AWS service quotas and limits 