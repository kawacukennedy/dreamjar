# Infrastructure

This directory contains infrastructure configurations for DreamJar.

## Local Development

To run the full stack locally:

1. Start databases:

   ```bash
   docker-compose up -d
   ```

2. Set environment variables in backend/.env:

   ```
   MONGO_URI=mongodb://admin:password@localhost:27017/dreamjar
   REDIS_URL=redis://localhost:6379
   ```

3. Start backend:

   ```bash
   cd ../backend
   npm run start:dev
   ```

4. Start frontend:
   ```bash
   cd ../frontend
   npm run dev
   ```

## Production Deployment

Use the deploy scripts in the root directory for staging/production deployment to Vercel, Render, and MongoDB Atlas.
