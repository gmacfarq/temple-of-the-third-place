# Temple of the Third Place - Management System

A full-stack web application for managing temple operations, member interactions, and sacrament administration.

## Current Features

- Authentication System
  - User registration and login
  - Role-based access control (member, advisor, admin)
  - JWT-based authentication
  - Admin seeding functionality

- Database Structure
  - User management tables
  - Sacrament inventory tables
  - Secure MySQL configuration

## Tech Stack

- Backend: Node.js with Express
- Database: MySQL 8.0
- Containerization: Docker & Docker Compose
- Authentication: JWT
- Development Tools: ESLint, Prettier, Jest

## Project Structure

```
tottp/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers (auth)
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API endpoints
│   │   ├── config/         # Database & seed configs
│   │   ├── app.js         # Express setup
│   │   └── server.js      # Entry point
│   ├── test-connection.js # Database connection tester
│   └── .env.example       # Environment template
├── docker-compose.yml     # Docker services config
├── Dockerfile.backend     # Backend container config
└── mysql-custom.cnf      # MySQL configuration
```

## Prerequisites

- Docker and Docker Compose
- Node.js 18 or higher
- MySQL 8.0

## Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd tottp
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configurations including:
   # - Database credentials
   # - JWT secret
   # - Admin email/password
   ```

3. Start the services:
   ```bash
   docker compose up --build
   ```

4. The API will be available at `http://localhost:3000`

## Development

- Run tests: `npm test`
- Lint code: `npm run lint`
- Format code: `npm run format`
- Development mode: `npm run dev`

## Database Schema

Currently implemented tables:
- users: Member and admin information
  - Authentication details
  - Role management
  - Subscription status
- sacraments: Inventory tracking
  - Storage and active inventory
  - Batch tracking
  - Donation suggestions

## API Endpoints

- Authentication
  - POST /api/auth/register - User registration
  - GET /api/auth/me - Get current user
  - GET /api/auth/users - List all users (admin only)

- Health Check
  - GET /health - API health status

## Planned Features

### Member Management
- Member check-in system
- Subscription management
- Member profile customization
- Activity tracking

### Sacrament Management
- Donation processing
- Inventory alerts
- Batch tracking system
- Usage analytics

### Administrative Tools
- Advanced reporting
- Audit logging
- Bulk operations
- Analytics dashboard

### Security Enhancements
- Two-factor authentication
- Enhanced role permissions
- Session management
- Security audit logging

## License

All Rights Reserved - Private Repository

[Contact Information Section Pending]