# DreamJar

Turn your dreams into smart contracts — stake, share, and achieve together on TON via a Telegram Mini-App.

## Overview

DreamJar is a platform that allows users to create "Wish Jars" (goals) backed by TON stakes and community pledges. Users create goals, stake TON, invite supporters, post progress, and resolve outcomes via community validation or designated validators. On success, dreamers unlock funds and NFTs; on failure, funds partially flow to social-impact pools.

## Architecture

- **Frontend**: React 18 Mini-App with TypeScript, hosted on Vercel
- **Backend**: NestJS API with MongoDB Atlas and Redis
- **Blockchain**: TON smart contracts (Tolk/FunC)
- **Storage**: IPFS + TON Storage for media proofs
- **State Management**: Recoil for client state, SWR for data fetching
- **Monitoring**: Sentry for error tracking, Logtail for logging

## Tech Stack

### Frontend

- React 18.2.0 with TypeScript
- Vite 5.0.0 for bundling
- Tailwind CSS 4.0 for styling
- Recoil 0.7.6 for state management
- SWR 2.2.0 for data fetching
- TON Connect SDK 1.2.0 for wallet integration

### Backend

- NestJS 10.0 with TypeScript
- MongoDB Atlas 6.x with Mongoose
- Redis 7.x with BullMQ for queues
- JWT for authentication
- Winston + Logtail for logging

### DevOps

- GitHub Actions for CI/CD
- Docker for containerization
- Sentry for monitoring
- Playwright for E2E testing

## Getting Started

1. Clone the repository
2. Install dependencies: `npm run install:all`
3. Set up environment variables (see docs/DEPLOYMENT.md)
4. Run development servers:
   - Frontend: `cd frontend && npm run dev`
   - Backend: `cd backend && npm run start:dev`

## Project Structure

- `frontend/`: React Mini-App with components, pages, hooks
- `backend/`: NestJS API with modules, controllers, services
- `contracts/`: TON smart contracts
- `docs/`: Documentation and specs

## API Documentation

See [docs/API.md](docs/API.md) for REST API endpoints.

## Testing

- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`
- Frontend: Vitest + React Testing Library
- Backend: Jest

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

## License

MIT
