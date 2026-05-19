backend/
├── src/
│   ├── config/
│   │   ├── db.js              # Database connection setup
│   │   └── env.js             # dotenv validation
│   │
│   ├── middleware/
│   │   ├── auth.js            # verifyToken - checks JWT, attaches req.user
│   │   ├── requireRole.js     # role guard factory: requireRole('employer')
│   │   └── errorHandler.js    # centralised Express error middleware
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │   │
│   │   ├── jobs/
│   │   │   ├── jobs.routes.js
│   │   │   ├── jobs.controller.js
│   │   │   └── jobs.service.js
│   │   │
│   │   ├── proposals/
│   │   │   ├── proposals.routes.js
│   │   │   ├── proposals.controller.js
│   │   │   └── proposals.service.js
│   │   │
│   │   └── users/
│   │       ├── users.routes.js
│   │       ├── users.controller.js
│   │       └── users.service.js
│   │
│   └── app.js                 # Express app: registers middleware + mounts routes
│
├── server.js                  # entry point — calls app.listen()
├── .env
└── package.json