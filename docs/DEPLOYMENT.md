# Deployment Runbook

## Environment Variables

### Backend

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT signing
- `SENTRY_DSN`: Sentry DSN for error tracking
- `IPFS_API_URL`: IPFS API endpoint

### Frontend

- `VITE_API_URL`: Backend API URL
- `VITE_SENTRY_DSN`: Sentry DSN
- `VITE_TONCONNECT_MANIFEST`: TonConnect manifest URL

## Deployment Steps

1. **Contracts:** Deploy to TON testnet/mainnet using TON CLI
2. **Backend:** Build and deploy to Render/AWS
3. **Frontend:** Build and deploy to Vercel
4. **Database:** Set up MongoDB Atlas
5. **Storage:** Configure IPFS/TON Storage

## Monitoring

- Sentry for errors
- UptimeRobot for uptime
- Logs in hosting provider
