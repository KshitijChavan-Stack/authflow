# AuthFlow 🔐

A production-ready Authentication & Authorization microservice built with Node.js, Express, MongoDB, and Redis.

## Features

### Phase 1: Core Authentication (Current)

- ✅ User registration with email verification
- ✅ Secure login with JWT tokens
- ✅ Refresh token rotation
- ✅ Password reset flow
- ✅ User profile management
- ✅ Account lockout after failed login attempts
- ✅ Rate limiting and security headers

### Phase 2: Advanced Features (Planned)

- 🔄 OAuth integration (Google, GitHub)
- 🔄 Two-factor authentication (TOTP)
- 🔄 Role-based access control (RBAC)
- 🔄 Session management
- 🔄 Enhanced security features

### Phase 3: Production Ready (Planned)

- 🔄 Client SDK
- 🔄 Admin dashboard API
- 🔄 Comprehensive testing
- 🔄 Docker containerization
- 🔄 CI/CD pipeline

## Tech Stack

- **Runtime:** Node.js v18+ (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Cache:** Redis (IORedis)
- **Authentication:** JWT, bcrypt
- **Validation:** Joi
- **Email:** Nodemailer
- **Logging:** Winston
- **Security:** Helmet, express-rate-limit

## 📋 Prerequisites

- Node.js v18 or higher
- Docker Desktop (for MongoDB and Redis)
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/authflow.git
cd authflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### 4. Start MongoDB and Redis with Docker

```bash
docker compose up -d
```

Verify containers are running:

```bash
docker ps
```

### 5. Test the setup

```bash
node test-setup.js
```

You should see:

```
✅ MongoDB connected successfully
✅ Redis connected successfully
```

### 6. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
authflow/
├── src/
│   ├── config/          # Database and Redis configuration
│   ├── models/          # Mongoose schemas
│   ├── repositories/    # Database operations
│   ├── services/        # Business logic
│   ├── controllers/     # Route handlers
│   ├── middlewares/     # Auth, validation, error handling
│   ├── routes/          # API routes
│   ├── validators/      # Request validation schemas
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── logs/                # Application logs
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment variables template
├── docker-compose.yml   # Docker services configuration
└── package.json
```

## 🔌 API Endpoints (Coming Soon)

### Authentication

```
POST   /api/v1/auth/register          - Register new user
POST   /api/v1/auth/verify-email      - Verify email
POST   /api/v1/auth/resend-verification - Resend verification email
POST   /api/v1/auth/login             - Login user
POST   /api/v1/auth/refresh           - Refresh access token
POST   /api/v1/auth/logout            - Logout user
POST   /api/v1/auth/forgot-password   - Request password reset
POST   /api/v1/auth/reset-password    - Reset password
```

### User Management

```
GET    /api/v1/user/profile           - Get user profile
PUT    /api/v1/user/profile           - Update user profile
PUT    /api/v1/user/password          - Change password
DELETE /api/v1/user/account           - Delete account
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🐳 Docker Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Connect to MongoDB shell
docker exec -it authflow_mongodb mongosh -u admin -p password123

# Connect to Redis CLI
docker exec -it authflow_redis redis-cli
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Refresh token rotation
- Account lockout after failed attempts
- Rate limiting on all endpoints
- Security headers with Helmet
- Input validation with Joi
- Email verification required
- Secure password reset flow

## 📝 Environment Variables

See `.env.example` for all available configuration options.

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!

## License

MIT License - feel free to use this project for learning purposes.

## Author

**Kshitij Chavan**

- GitHub: [@KshitijChavan-Stack](https://github.com/KshitijChavan-Stack)

## Acknowledgments

- Built as a portfolio project to demonstrate backend development skills
- Inspired by modern authentication best practices

---

**Status:** 🚧 Work in Progress - Phase 1 (Core Authentication) in development

```

---

## Step 2: Update .gitignore

Make sure your `.gitignore` is complete:
```

# Dependencies

node_modules/
package-lock.json
yarn.lock

# Environment variables

.env
.env.local
.env.\*.local

# Logs

logs/
_.log
npm-debug.log_
yarn-debug.log*
yarn-error.log*

# OS files

.DS*Store
.DS_Store?
.*\*
.Spotlight-V100
.Trashes

# IDE

.vscode/
.idea/
_.swp
_.swo
\*~

# Testing

coverage/
.nyc_output/

# Build

dist/
build/

# Docker

.docker/
