# Homeland API

Node.js/Express REST API for the Homeland Job Listings platform. Supports authentication, job management, proposals, and escrow-based payments.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MySQL (XAMPP)
- **Auth**: JWT (access token 1hr) + refresh tokens (7 days)
- **Password hashing**: bcryptjs (12 rounds)
- **Validation**: express-validator

---

## Setup

### 1. Prerequisites
- XAMPP running (Apache + MySQL)
- Node.js v18+

### 2. Database
Open phpMyAdmin (`http://localhost/phpmyadmin`) and run these SQL files in order:
```
backend/schema.sql          — users, refresh_tokens
backend/schema_jobs.sql     — jobs, proposals, contracts
backend/schema_escrow.sql   — escrow columns, payments
```

### 3. Environment
```bash
cp .env.example .env
```
Edit `.env` with your MySQL credentials (XAMPP default: user=`root`, password=`""`).

### 4. Install & Run
```bash
npm install
npm run dev       # development (nodemon)
npm start         # production
npm test          # run automated tests
```

Server runs on `http://localhost:5000`.

---

## Response Format

All endpoints return consistent JSON:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": { }
}
```

Errors:
```json
{
  "success": false,
  "message": "Error description"
}
```

Validation errors (422):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email must be a valid email address" }
  ]
}
```

---

## Endpoints

### Auth

#### POST /api/auth/register
Register a new user.

**Auth required**: No

**Request body**:
| Field | Type | Rules |
|-------|------|-------|
| name | string | 2–100 characters |
| email | string | Valid email format |
| phone | string | Kenyan format: 07XXXXXXXX |
| password | string | Min 8 chars, 1 uppercase, 1 number |
| role | string | `freelancer` or `employer` |

**Success** `201`:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": 1, "name": "Evans", "email": "evans@example.com", "phone": "0712345678", "role": "freelancer", "created_at": "..." }
  }
}
```

**Errors**:
- `422` — validation failed (field-level errors array)
- `409` — email already registered

---

#### POST /api/auth/login
Login and receive tokens.

**Auth required**: No

**Request body**:
| Field | Type |
|-------|------|
| email | string |
| password | string |

**Success** `200`:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "name": "Evans", "role": "freelancer" },
    "accessToken": "eyJ...",
    "refreshToken": "uuid-v4-string"
  }
}
```

**Errors**:
- `401` — invalid email or password
- `422` — validation failed

---

#### POST /api/auth/refresh
Exchange a refresh token for a new access token.

**Auth required**: No

**Request body**:
| Field | Type |
|-------|------|
| refreshToken | string |

**Success** `200`:
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": { "accessToken": "eyJ..." }
}
```

**Errors**:
- `401` — invalid or expired refresh token

---

#### GET /api/auth/me
Get the currently authenticated user's profile.

**Auth required**: Yes — `Authorization: Bearer <accessToken>`

**Success** `200`:
```json
{
  "success": true,
  "message": "User profile fetched",
  "data": {
    "user": { "id": 1, "name": "Evans", "email": "evans@example.com", "phone": "0712345678", "role": "freelancer", "created_at": "..." }
  }
}
```

**Errors**:
- `401` — missing or invalid token

---

### Jobs

#### GET /api/jobs
List all jobs with optional filtering and pagination.

**Auth required**: No

**Query params**:
| Param | Description |
|-------|-------------|
| search | Search in title and description |
| category | Filter by category (exact match) |
| location | Filter by location (exact match) |
| budget_min | Minimum budget |
| budget_max | Maximum budget |
| sort | `newest` (default), `budget_high`, `budget_low` |
| page | Page number (default: 1) |
| limit | Results per page (default: 10, max: 50) |

**Success** `200`:
```json
{
  "success": true,
  "message": "Jobs fetched successfully",
  "data": {
    "jobs": [ { "id": 1, "title": "...", "budget": 45000, "proposal_count": 3, "skills": ["Node.js"] } ],
    "pagination": { "total": 25, "page": 1, "limit": 10, "total_pages": 3 }
  }
}
```

---

#### POST /api/jobs
Create a new job listing.

**Auth required**: Yes — employer role only

**Request body**:
| Field | Type | Rules |
|-------|------|-------|
| title | string | 5–255 characters |
| description | string | Min 20 characters |
| category | string | Required |
| location | string | Required |
| budget | number | Positive number |
| skills | array | Non-empty array of strings |
| deadline | string | Valid date (YYYY-MM-DD), must be in future |

**Success** `201`:
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": { "job": { "id": 1, "title": "...", "employer_name": "TechVentures", "proposal_count": 0 } }
}
```

**Errors**:
- `401` — not authenticated
- `403` — not an employer
- `422` — validation failed

---

#### GET /api/jobs/:id
Get a single job with its proposal count.

**Auth required**: No

**Success** `200`:
```json
{
  "success": true,
  "data": { "job": { "id": 1, "title": "...", "description": "...", "skills": ["Node.js"], "proposal_count": 5 } }
}
```

**Errors**:
- `404` — job not found

---

#### POST /api/jobs/:id/proposals
Submit a proposal on a job.

**Auth required**: Yes — freelancer role only

**Request body**:
| Field | Type | Rules |
|-------|------|-------|
| cover_letter | string | Min 50 characters |
| proposed_budget | number | Positive number |
| timeline_days | integer | Positive integer |

**Success** `201`:
```json
{
  "success": true,
  "message": "Proposal submitted successfully",
  "data": { "proposal": { "id": 1, "job_id": 1, "status": "pending", "proposed_budget": 40000 } }
}
```

**Errors**:
- `403` — not a freelancer
- `404` — job not found
- `409` — already submitted a proposal for this job
- `422` — validation failed

---

#### PUT /api/jobs/:id/proposals/:proposalId/accept
Accept a proposal. Creates a contract and rejects all other proposals.

**Auth required**: Yes — employer who owns the job

**Success** `200`:
```json
{
  "success": true,
  "message": "Proposal accepted. Contract created.",
  "data": { "contract": { "id": 1, "agreed_budget": 40000, "employer_name": "TechVentures", "freelancer_name": "Jane" } }
}
```

**Errors**:
- `403` — not the job owner
- `404` — job or proposal not found
- `400` — proposal already accepted/rejected

---

### Escrow / Contracts

#### POST /api/contracts/:id/fund
Employer triggers mock M-Pesa payment. Moves contract to `funded`.

**Auth required**: Yes — employer who owns the contract

**Success** `200`:
```json
{
  "success": true,
  "message": "Mock M-Pesa payment received. Funds held in escrow.",
  "data": { "contract_id": 1, "status": "funded", "mpesa_receipt": "QKA12BXYZ3", "amount_held": 40000 }
}
```

**Errors**:
- `403` — not the contract owner
- `400` — contract not in `pending` status

---

#### POST /api/contracts/:id/deliver
Freelancer marks work as delivered. Moves contract to `delivered`.

**Auth required**: Yes — freelancer on the contract

**Success** `200`:
```json
{
  "success": true,
  "message": "Work marked as delivered. Awaiting employer approval.",
  "data": { "contract_id": 1, "status": "delivered" }
}
```

**Errors**:
- `403` — not the freelancer on this contract
- `400` — contract not in `funded` status

---

#### POST /api/contracts/:id/approve
Employer approves delivery. Releases payment: 92% to freelancer, 8% platform fee.

**Auth required**: Yes — employer who owns the contract

**Success** `200`:
```json
{
  "success": true,
  "message": "Payment released successfully.",
  "data": {
    "contract_id": 1,
    "status": "released",
    "total_budget": 40000,
    "freelancer_payout": 36800,
    "platform_fee": 3200
  }
}
```

**Errors**:
- `403` — not the contract owner
- `400` — contract not in `delivered` status

---

#### POST /api/contracts/:id/dispute
Either party raises a dispute. Moves contract to `disputed`.

**Auth required**: Yes — employer or freelancer on the contract

**Request body**:
| Field | Type | Rules |
|-------|------|-------|
| reason | string | Min 20 characters |

**Success** `200`:
```json
{
  "success": true,
  "message": "Dispute raised. The contract is now under review.",
  "data": { "contract_id": 1, "status": "disputed", "reason": "..." }
}
```

**Errors**:
- `403` — not a party to this contract
- `400` — contract not in `funded` or `delivered` status
- `422` — reason too short

---

## Automated Tests

Three tests are included in `tests/auth.test.js`:

1. **Successful registration returns 201** — verifies the user object is returned without a password field
2. **Wrong password returns 401** — verifies authentication rejects bad credentials
3. **Freelancer cannot POST a job (403)** — verifies role-based access control

Run with:
```bash
npm test
```

---

## Postman Collection

Import `homeland-api.postman_collection.json` into Postman. The collection:
- Uses collection variables (`employer_token`, `freelancer_token`, `job_id`, etc.) that are auto-set by test scripts on login/create
- Covers all endpoints with success and failure cases
- Includes inline Postman tests for key assertions
