# Homeland Backend File Structure

backend/
├── src/
│   ├── config/
│   │   └── db.js                    # MySQL connection pool (mysql2/promise)
│   │
│   ├── middleware/
│   │   ├── auth.js                  # verifyToken + requireRole factory
│   │   └── errorHandler.js          # centralised Express error handler (4 args)
│   │
│   ├── models/
│   │   ├── User.js                  # findById, findByEmail, create
│   │   ├── RefreshToken.js          # create, findByToken, deleteByToken
│   │   ├── Job.js                   # create, findById, findAll (with filters)
│   │   ├── Proposal.js              # create, findById, existsByJobAndFreelancer, acceptProposal
│   │   ├── Contract.js              # create, findById, setFunded/Delivered/Released/Disputed
│   │   └── Payment.js               # create, findByContractId
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.validation.js
│   │   ├── jobs/
│   │   │   ├── jobs.routes.js
│   │   │   ├── jobs.controller.js
│   │   │   ├── jobs.service.js
│   │   │   └── jobs.validation.js
│   │   └── escrow/
│   │       ├── escrow.routes.js
│   │       ├── escrow.controller.js
│   │       └── escrow.service.js
│   │
│   ├── utils/
│   │   └── autoReleaseEscrow.js     # standalone utility — finds stale contracts, releases payment
│   │
│   └── app.js                       # Express app — registers middleware, mounts all routes
│
├── tests/
│   └── auth.test.js                 # Jest + Supertest automated tests
│
├── server.js                        # entry point — verifies DB then calls app.listen()
├── schema.sql                       # users, refresh_tokens
├── schema_jobs.sql                  # jobs, proposals, contracts
├── schema_escrow.sql                # escrow columns on contracts, payments table
├── homeland-api.postman_collection.json
├── .env
├── .env.example
└── package.json