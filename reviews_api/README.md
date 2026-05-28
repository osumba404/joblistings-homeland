# reviews_api

A REST API for the Homeland Jobs freelance marketplace that handles client reviews of freelancers. Clients can submit a review against a completed, approved contract, and anyone can read a freelancer's public review history.

---

## What this project does

- Allows authenticated clients to post a rating and comment for a freelancer they have an approved contract with
- Prevents duplicate reviews per contract at both the application and database level
- Automatically recalculates a freelancer's `average_rating` and `total_reviews` on every new review using a MySQL transaction
- Exposes a public paginated endpoint to read all reviews for any freelancer

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_HOST=localhost
DB_USER=<your_db_user>
DB_PASSWORD=<your_db_password>
DB_NAME=<your_db_name>
```

### 3. Run the development server

```bash
npm run dev
```

The server starts on `http://localhost:3000` (or the port set in `.env`).

---

## Authentication

This API uses a demo authentication middleware that simulates JWT-based identity. Instead of a token, include the requesting user's ID in the request header:

```
x-user-id: 42
```

The middleware reads this header, parses it as an integer, and attaches it to `req.user.id` for use in route handlers. If the header is missing, the request is rejected with `401`.

In a production system this middleware would be replaced with JWT verification — the rest of the route logic would remain unchanged.

---

## Endpoints

### POST /api/reviews

Submit a review for a freelancer. Requires authentication.

**Headers**

| Header       | Required | Description                  |
|--------------|----------|------------------------------|
| x-user-id    | Yes      | ID of the client making the request |

**Request body**

```json
{
  "freelancerId": 7,
  "contractId": 3,
  "rating": 5,
  "comment": "Delivered excellent work on time and within budget."
}
```

| Field        | Type    | Rules                        |
|--------------|---------|------------------------------|
| freelancerId | integer | Required                     |
| contractId   | integer | Required                     |
| rating       | integer | Required, 1–5                |
| comment      | string  | Required, minimum 20 characters |

**Responses**

| Status | Description |
|--------|-------------|
| 201    | Review created successfully |
| 401    | Missing `x-user-id` header |
| 403    | No approved contract found between the client and freelancer |
| 409    | A review for this contract already exists |
| 422    | Request body failed validation |
| 500    | Internal server error |

**201 response body**

```json
{
  "review": {
    "id": 12,
    "client_id": 42,
    "freelancer_id": 7,
    "contract_id": 3,
    "rating": 5,
    "comment": "Delivered excellent work on time and within budget.",
    "created_at": "2024-11-01T10:23:00.000Z"
  },
  "freelancer": {
    "id": 7,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "average_rating": "4.80",
    "total_reviews": 15
  }
}
```

**422 response body**

```json
{
  "errors": [
    {
      "field": "rating",
      "message": "rating must be an integer between 1 and 5"
    }
  ]
}
```

---

### GET /api/freelancers/:id/reviews

Retrieve paginated reviews for a freelancer. Public — no authentication required.

**URL parameters**

| Parameter | Description          |
|-----------|----------------------|
| id        | Freelancer's user ID (positive integer) |

**Query parameters**

| Parameter | Default | Max | Description        |
|-----------|---------|-----|--------------------|
| page      | 1       | —   | Page number        |
| limit     | 10      | 50  | Results per page   |

**Example request**

```
GET /api/freelancers/7/reviews?page=1&limit=10
```

**Responses**

| Status | Description |
|--------|-------------|
| 200    | Success |
| 400    | `:id` is not a positive integer |
| 404    | Freelancer not found |
| 500    | Internal server error |

**200 response body**

```json
{
  "freelancerId": 7,
  "total": 15,
  "page": 1,
  "limit": 10,
  "totalPages": 2,
  "reviews": [
    {
      "id": 12,
      "rating": 5,
      "comment": "Delivered excellent work on time and within budget.",
      "created_at": "2024-11-01T10:23:00.000Z",
      "reviewer_name": "John Doe"
    }
  ]
}
```

---

## Security

### Parameterised queries
Every SQL statement uses `?` placeholders with values passed as a separate array. No user input is ever concatenated into a query string, eliminating SQL injection risk.

### Input validation
All POST body fields are validated with `express-validator` before any database call is made. Invalid requests are rejected at the boundary with a `422` and a structured error array.

### Ownership checks
Before inserting a review the API verifies that a contract row exists where `client_id` matches the requesting user's ID, `freelancer_id` matches the submitted `freelancerId`, and `status = 'approved'`. A client cannot review a freelancer they have no approved contract with.

### Duplicate prevention
The application checks for an existing review on the same `contract_id` before proceeding and returns `409` if one is found. A `UNIQUE` constraint on `contract_id` in the `reviews` table enforces this at the database level as a second line of defence.

### MySQL transaction
The INSERT into `reviews` and the UPDATE to the freelancer's `average_rating` and `total_reviews` in `users` are executed inside a single transaction. If either statement fails the transaction is rolled back, keeping the data consistent.

### No stack trace exposure
The global error handler logs the full error server-side with `console.error` but returns only `{ "error": "Internal server error" }` to the client, preventing internal implementation details from leaking.
