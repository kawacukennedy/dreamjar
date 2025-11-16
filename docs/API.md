# DreamJar API Documentation

DreamJar is a platform for turning dreams into smart contracts on the TON blockchain. This API allows users to create dreams, pledge support, upload proof of completion, and participate in community voting.

## Base URL

```
https://api.dreamjar.com/api/v1
```

## Authentication

All API requests require authentication using JWT tokens obtained through wallet signing.

### POST /auth/wallet-challenge

Generate a challenge message for wallet signing.

**Request:**

```bash
curl -X POST https://api.dreamjar.com/api/v1/auth/wallet-challenge \
  -H "Content-Type: application/json" \
  -d '{"address": "UQAbCdEf..."}'
```

**Response (200):**

```json
{
  "challengeMessage": "Sign this message to authenticate with DreamJar: 1703123456789"
}
```

**Error Responses:**

- `400`: Missing address
- `500`: Server error

### POST /auth/wallet-verify

Verify signed message and issue JWT token.

**Request:**

```bash
curl -X POST https://api.dreamjar.com/api/v1/auth/wallet-verify \
  -H "Content-Type: application/json" \
  -d '{
    "address": "UQAbCdEf...",
    "signedMessage": "base64signature...",
    "challengeMessage": "Sign this message..."
  }'
```

**Response (200):**

```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "walletAddress": "UQAbCdEf...",
    "displayName": null,
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z",
    "lastSeen": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**

- `400`: Missing required fields
- `401`: Invalid signature
- `500`: Server error

### GET /auth/me

Get current user information.

**Headers:** `Authorization: Bearer <jwt>`

**Request:**

```bash
curl -X GET https://api.dreamjar.com/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200):**

```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "walletAddress": "UQAbCdEf...",
    "displayName": "Dreamer123",
    "avatarUrl": "https://example.com/avatar.jpg",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z",
    "lastSeen": "2024-01-15T10:35:00Z"
  }
}
```

## WishJar Endpoints

### POST /wish

Create a new dream (WishJar).

**Headers:** `Authorization: Bearer <jwt>`

**Request:**

```bash
curl -X POST https://api.dreamjar.com/api/v1/wish \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Run a Marathon",
    "description": "Complete a full marathon in under 4 hours",
    "category": "Health & Fitness",
    "stakeAmount": 1000000000,
    "deadline": "2024-12-31T00:00:00Z",
    "validatorMode": "community",
    "validators": []
  }'
```

**Parameters:**

- `title` (string, required): Dream title (3-100 characters)
- `description` (string, required): Detailed description (10-1000 characters)
- `category` (string, optional): Category from predefined list
- `stakeAmount` (number, required): Amount to stake in nanotons (min: 0.01 TON)
- `deadline` (string, required): ISO 8601 date string (must be in future)
- `validatorMode` (string, required): "community" or "designatedValidators"
- `validators` (array, optional): Array of validator addresses

**Response (200):**

```json
{
  "wishJar": {
    "_id": "507f1f77bcf86cd799439011",
    "ownerId": "507f1f77bcf86cd799439012",
    "title": "Run a Marathon",
    "description": "Complete a full marathon in under 4 hours",
    "category": "Health & Fitness",
    "contractAddress": "0:1234567890abcdef",
    "stakeAmount": 1000000000,
    "pledgedAmount": 0,
    "deadline": "2024-12-31T00:00:00Z",
    "status": "Active",
    "validatorMode": "community",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**

- `400`: Validation errors
- `401`: Unauthorized
- `429`: Rate limited

### GET /wish

List dreams with pagination and filtering.

**Query Parameters:**

- `limit` (number, optional): Number of results (1-100, default: 10)
- `cursor` (string, optional): MongoDB ObjectId for cursor-based pagination
- `search` (string, optional): Search in title and description
- `status` (string, optional): Filter by status
- `category` (string, optional): Filter by category

**Request:**

```bash
curl -X GET "https://api.dreamjar.com/api/v1/wish?limit=20&search=marathon&status=active"
```

**Response (200):**

```json
{
  "wishes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Run a Marathon",
      "description": "Complete a full marathon in under 4 hours",
      "category": "Health & Fitness",
      "stakeAmount": 1000000000,
      "pledgedAmount": 250000000,
      "deadline": "2024-12-31T00:00:00Z",
      "status": "Active",
      "ownerId": {
        "displayName": "Dreamer123",
        "walletAddress": "UQAbCdEf..."
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "hasNextPage": true,
    "nextCursor": "507f1f77bcf86cd799439011",
    "limit": 20
  }
}
```

### GET /wish/:id

Get detailed information about a specific dream.

**Path Parameters:**

- `id` (string, required): WishJar ObjectId

**Request:**

```bash
curl -X GET https://api.dreamjar.com/api/v1/wish/507f1f77bcf86cd799439011
```

**Response (200):**

```json
{
  "wish": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Run a Marathon",
    "description": "Complete a full marathon in under 4 hours",
    "category": "Health & Fitness",
    "stakeAmount": 1000000000,
    "pledgedAmount": 250000000,
    "deadline": "2024-12-31T00:00:00Z",
    "status": "Active",
    "ownerId": {
      "displayName": "Dreamer123",
      "walletAddress": "UQAbCdEf..."
    }
  },
  "pledges": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "supporterId": {
        "displayName": "Supporter1",
        "walletAddress": "UQAbCdEf..."
      },
      "amount": 100000000,
      "createdAt": "2024-01-15T11:00:00Z"
    }
  ],
  "proofs": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "uploaderId": {
        "displayName": "Dreamer123",
        "walletAddress": "UQAbCdEf..."
      },
      "mediaURI": "ipfs://Qm...",
      "caption": "Training run completed!",
      "createdAt": "2024-01-16T10:00:00Z",
      "voteCounts": { "yes": 5, "no": 1 }
    }
  ]
}
```

### POST /wish/:id/pledge

Pledge TON to support a dream.

**Headers:** `Authorization: Bearer <jwt>`

**Path Parameters:**

- `id` (string, required): WishJar ObjectId

**Request:**

```bash
curl -X POST https://api.dreamjar.com/api/v1/wish/507f1f77bcf86cd799439011/pledge \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000000}'
```

**Parameters:**

- `amount` (number, required): Amount to pledge in nanotons (min: 0.01 TON)

**Response (200):**

```json
{
  "status": "success",
  "pledge": {
    "_id": "507f1f77bcf86cd799439015",
    "wishJarId": "507f1f77bcf86cd799439011",
    "supporterId": "507f1f77bcf86cd799439012",
    "amount": 50000000,
    "txHash": "0x1234567890abcdef",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

### POST /wish/:id/proof

Upload proof of dream progress.

**Headers:** `Authorization: Bearer <jwt>`

**Path Parameters:**

- `id` (string, required): WishJar ObjectId

**Request:**

```bash
curl -X POST https://api.dreamjar.com/api/v1/wish/507f1f77bcf86cd799439011/proof \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "mediaFile=@training_photo.jpg" \
  -F "caption=Completed my first training run!"
```

**Form Data:**

- `mediaFile` (file, required): Image or video file
- `caption` (string, optional): Description of the proof

**Response (200):**

```json
{
  "proof": {
    "_id": "507f1f77bcf86cd799439016",
    "wishJarId": "507f1f77bcf86cd799439011",
    "uploaderId": "507f1f77bcf86cd799439012",
    "mediaURI": "ipfs://Qm...",
    "mediaHash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    "caption": "Completed my first training run!",
    "createdAt": "2024-01-16T10:00:00Z"
  }
}
```

### POST /wish/:wishId/proof/:proofId/vote

Vote on proof of completion.

**Headers:** `Authorization: Bearer <jwt>`

**Path Parameters:**

- `wishId` (string, required): WishJar ObjectId
- `proofId` (string, required): Proof ObjectId

**Request:**

```bash
curl -X POST https://api.dreamjar.com/api/v1/wish/507f1f77bcf86cd799439011/proof/507f1f77bcf86cd799439016/vote \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"choice": "yes"}'
```

**Parameters:**

- `choice` (string, required): "yes" or "no"

**Response (200):**

```json
{
  "status": "success",
  "currentCounts": { "yes": 6, "no": 1 }
}
```

### GET /wish/stats

Get global platform statistics.

**Request:**

```bash
curl -X GET https://api.dreamjar.com/api/v1/wish/stats
```

**Response (200):**

```json
{
  "totalWishes": 1250,
  "activeWishes": 890,
  "resolvedSuccess": 234,
  "resolvedFail": 126,
  "totalPledged": 15000000000,
  "totalUsers": 567
}
```

### GET /wish/leaderboard

Get user leaderboard ranked by total pledged amount.

**Request:**

```bash
curl -X GET https://api.dreamjar.com/api/v1/wish/leaderboard
```

**Response (200):**

```json
[
  {
    "user": {
      "displayName": "GenerousSupporter",
      "walletAddress": "UQAbCdEf...",
      "avatarUrl": "https://example.com/avatar.jpg"
    },
    "totalPledged": 5000000000,
    "dreamsCreated": 3,
    "successRate": 67,
    "rank": 1
  }
]
```

## Error Handling

All API endpoints return appropriate HTTP status codes and error messages:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title must be 3-100 characters"
    }
  ]
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- General endpoints: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Wallet verification: 10 requests per hour
- Pledging: 5 requests per minute
- Voting: 10 requests per minute

Rate limited requests return HTTP 429 with a retry-after header.

## Webhooks

DreamJar supports webhooks for real-time notifications. Configure webhook URLs in your account settings to receive notifications for:

- New pledges
- Proof uploads
- Resolution events
- Deadline reminders

## SDKs and Libraries

- **JavaScript SDK**: `npm install @dreamjar/sdk`
- **Python SDK**: `pip install dreamjar-sdk`
- **Go SDK**: `go get github.com/dreamjar/go-sdk`
