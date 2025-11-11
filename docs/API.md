# DreamJar API Documentation

## Authentication

### POST /auth/wallet-challenge

Generate a challenge message for wallet signing.

**Request:**

```json
{
  "address": "string"
}
```

**Response:**

```json
{
  "challengeMessage": "string"
}
```

### POST /auth/wallet-verify

Verify signed message and issue JWT.

**Request:**

```json
{
  "address": "string",
  "signedMessage": "string",
  "challengeMessage": "string"
}
```

**Response:**

```json
{
  "jwt": "string",
  "user": { ... }
}
```

## WishJar Endpoints

### POST /wish

Create a new WishJar.

**Headers:** `Authorization: Bearer <jwt>`

**Request:**

```json
{
  "title": "string",
  "description": "string",
  "stakeAmount": 1000000000,
  "deadline": "2024-12-31T00:00:00Z",
  "validatorMode": "community"
}
```

### GET /wish/:id

Get WishJar details.

**Response:**

```json
{
  "wishJar": { ... },
  "pledges": [ ... ],
  "proofs": [ ... ]
}
```

### POST /wish/:id/pledge

Pledge to a WishJar.

**Headers:** `Authorization: Bearer <jwt>`

**Request:**

```json
{
  "amount": 1000000000
}
```

### POST /wish/:id/proof

Post proof for WishJar.

**Headers:** `Authorization: Bearer <jwt>`

**Form Data:**

- `mediaFile`: file
- `caption`: string
