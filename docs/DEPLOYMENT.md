# Deployment Runbook

## Prerequisites

- GitHub repository set up
- MongoDB Atlas account
- Render/Railway account
- Vercel account
- TON wallet with testnet TON
- Telegram Bot token

## 1. Database Setup

1. Create MongoDB Atlas cluster
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for development)
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dreamjar`

## 2. Backend Deployment (Render)

1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Create new Web Service
4. Select repository and branch
5. Set build settings:
   - Build Command: `npm run build`
   - Start Command: `npm start`
6. Set environment variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Generate a secure random string
   - `SENTRY_DSN`: From Sentry project
7. Deploy

## 3. Contract Deployment (TON Testnet)

1. Install TON CLI: `npm install -g ton-cli`
2. Compile contracts:
   ```bash
   ton-cli compile contracts/WishJar.fc
   ton-cli compile contracts/WishJarFactory.fc
   ```
3. Deploy to testnet:
   ```bash
   ton-cli deploy --network testnet WishJarFactory.tvc
   ```
4. Note contract addresses

## 4. Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Set build settings:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
4. Set environment variables:
   - `VITE_API_URL`: Your Render backend URL
   - `VITE_SENTRY_DSN`: Sentry DSN
   - `VITE_TONCONNECT_MANIFEST`: `https://your-vercel-domain.vercel.app/tonconnect-manifest.json`
5. Update `frontend/vercel.json`:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-render-backend.onrender.com/:path*"
       }
     ]
   }
   ```
6. Deploy

## 5. Telegram Bot Setup

1. Go to [@BotFather](https://t.me/botfather) on Telegram
2. Send `/setdomain`
3. Select your bot
4. Set domain: `https://your-vercel-domain.vercel.app`
5. Send `/setmenubutton` to add web app button

## 6. Environment Variables

### Backend (Render)

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: 32-character random string
- `SENTRY_DSN`: https://sentry.io/settings/projects/dreamjar/keys/
- `IPFS_API_URL`: https://ipfs.infura.io:5001 (or your IPFS endpoint)

### Frontend (Vercel)

- `VITE_API_URL`: https://dreamjar-backend.onrender.com
- `VITE_SENTRY_DSN`: Sentry DSN
- `VITE_TONCONNECT_MANIFEST`: https://dreamjar.vercel.app/tonconnect-manifest.json
- `VITE_POSTHOG_KEY`: PostHog project API key

## 7. Testing

1. Test wallet connection
2. Create a test wish jar
3. Make a pledge
4. Upload proof
5. Vote on validation

## 8. Monitoring

- Sentry for error tracking
- Vercel Analytics for frontend metrics
- Render logs for backend
- MongoDB Atlas monitoring

## Rollback Plan

- Keep previous deployments active until new one is verified
- Use Vercel's deployment history for quick rollback
- Have database backups before major changes
