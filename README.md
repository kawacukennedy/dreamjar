# DreamJar

Turn your dreams into smart contracts — stake, share, and achieve together on TON via a Telegram Mini-App.

## Overview

DreamJar is a platform that allows users to create "Wish Jars" (goals) backed by TON stakes and community pledges. Users create goals, stake TON, invite supporters, post progress, and resolve outcomes via community validation or designated validators. On success, dreamers unlock funds and NFTs; on failure, funds partially flow to social-impact pools.

## Architecture

- **Frontend**: React Mini-App hosted on Telegram
- **Backend**: Node.js/Express API with MongoDB
- **Blockchain**: TON smart contracts (Tolk/FunC)
- **Storage**: TON Storage + IPFS for media proofs

## Getting Started

1. Clone the repository
2. Install dependencies: `npm run install:all`
3. Set up environment variables (see docs/DEPLOYMENT.md)
4. Run development servers:
   - Frontend: `cd frontend && npm run dev`
   - Backend: `cd backend && npm run dev`

## Project Structure

- `frontend/`: React Mini-App
- `backend/`: Express API server
- `contracts/`: TON smart contracts
- `infrastructure/`: Deployment configs
- `docs/`: Documentation

## API Documentation

See [docs/API.md](docs/API.md) for API endpoints.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

## License

MIT
