# End-to-End Testing Plan

## Test Environment

- Frontend: https://frontend-lt2r6kq0b-kawacukennedys-projects.vercel.app
- Backend: https://dreamjar-backend.onrender.com
- Contracts: Deployed on TON testnet

## Test Cases

### 1. Wallet Connection

- [ ] Connect TonKeeper wallet
- [ ] Verify wallet address display
- [ ] Disconnect wallet

### 2. User Registration

- [ ] Sign wallet challenge
- [ ] Verify JWT token creation
- [ ] Check user profile creation

### 3. Create Wish Jar

- [ ] Fill form: title, description, stake, deadline
- [ ] Upload metadata (optional)
- [ ] Submit and verify contract deployment
- [ ] Check wish jar appears in home feed

### 4. Browse Wish Jars

- [ ] Load home page
- [ ] Filter by category
- [ ] Search by title
- [ ] Infinite scroll pagination

### 5. Pledge to Wish Jar

- [ ] View wish jar details
- [ ] Enter pledge amount
- [ ] Confirm transaction
- [ ] Verify pledge recorded

### 6. Upload Proof

- [ ] As dreamer, upload photo/video proof
- [ ] Add caption
- [ ] Submit proof

### 7. Vote on Proof

- [ ] As supporter, view proof
- [ ] Cast yes/no vote
- [ ] Verify vote counted

### 8. Resolve Wish Jar

- [ ] After deadline, check resolution
- [ ] Verify fund distribution

### 9. Profile Management

- [ ] View own profile
- [ ] Check achievements
- [ ] Edit display name

### 10. Telegram Mini-App

- [ ] Open in Telegram
- [ ] Test all features in mini-app

## Performance Tests

- [ ] Page load times < 3s
- [ ] API response times < 1s
- [ ] Image loading optimization

## Security Tests

- [ ] JWT token validation
- [ ] Input sanitization
- [ ] Rate limiting

## Tools

- Manual testing with TON testnet wallets
- Browser dev tools for performance
- Sentry for error monitoring
