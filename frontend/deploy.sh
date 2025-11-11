#!/bin/bash

# Build the app
npm run build

# Deploy to Vercel (if using Vercel CLI)
# vercel --prod

# Or deploy to Netlify
# netlify deploy --prod --dir=dist

echo "Build completed. Upload dist/ folder to your hosting provider."