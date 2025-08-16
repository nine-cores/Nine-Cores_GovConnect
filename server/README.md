# 🏛️ Government Appointment & Citizen Management System

A comprehensive backend API system for managing government appointments and citizen registration with external data integration.

## This is implemented using [LightTS](https://github.com/taedmonds/lightts)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development Workflow](#-development-workflow)
- [Testing](#-testing)
- [Production Deployment](#-production-deployment)
- [Troubleshooting](#-troubleshooting)

## ✨ Features

### Core Functionality
- 🔐 **JWT Authentication & Authorization** - Role-based access control
- 👥 **User Management** - Admin, GN Officer, MT Officer roles
- 🏢 **Service Unit Management** - Government departments and divisions
- 📅 **Appointment Booking System** - Citizens can book appointments
- 🆔 **Citizen Management** - Registration with external data integration
- 🔍 **Search & Filtering** - Advanced search capabilities
- 📊 **Data Validation** - Comprehensive input validation with Joi

### Advanced Features
- 🌐 **External API Integration** - Government database adapter pattern
- 🗄️ **Database Migrations** - Structured database versioning
- 🌱 **Data Seeding** - Pre-populated test data
- 📝 **Audit Logging** - Comprehensive activity tracking
- 🔒 **Security** - Password hashing, input sanitization, CORS
- 🐳 **Docker Support** - Containerized development environment

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Logging**: Pino
- **Development**: Docker Compose, Nodemon
- **Code Quality**: ESLint, Prettier

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** (v8 or higher) - [Install Guide](https://pnpm.io/installation)
- **Docker & Docker Compose** - [Install Guide](https://docs.docker.com/get-docker/)
- **Git** - [Install Guide](https://git-scm.com/downloads)

### Verify Installation
```bash
node --version    # Should be v18+
pnpm --version    # Should be v8+
docker --version  # Should be recent version
```

## 🚀 Quick Start

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd test

# Install dependencies
pnpm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env  # or use your preferred editor
```

### 3. Database Setup
```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Run database migrations
pnpm migrate

# Seed initial data
pnpm seed:run
```

### 4. Start Development Server
```bash
# Start the API server
pnpm dev
```

🎉 **Your API is now running at `http://localhost:4601`**

Base URL: `http://localhost:4601/api`

## ⚙️ Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Environment
NODE_ENV=development

# API Configuration
PORT=4601
API_URL=http://localhost:4601/api
APP_URL=http://localhost:4600

# Database Configuration
DB_USER=your_username
DB_NAME=your_database
DB_PWD=your_password
DB_HOST=localhost
DB_PORT=4605
PGADMIN_PORT=4606

# JWT Secrets
ACCESS_JWT_SECRET=your_access_secret
REFRESH_JWT_SECRET=your_refresh_secret
```

### Generate Secure JWT Secrets

```bash
# Generate secure random strings for JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🗄️ Database Setup

### 1. Start PostgreSQL Container

```bash
# Start database services
docker-compose up -d

# Verify containers are running
docker-compose ps
```

You should see:
- `postgres_rootcode` - PostgreSQL database
- `pgadmin_container` - PgAdmin web interface

### 2. Database Access

**PgAdmin Web Interface:**
- URL: `http://localhost:4606`
- Email: `example@example.com`
- Password: `example`

**Direct Database Connection:**
- Host: `localhost`
- Port: `4605`
- Database: `your_database`
- Username: `your_username`
- Password: `your_password`

### 3. Initialize Database Schema

```bash
# Run all pending migrations
pnpm migrate

# Verify migration status
pnpm migrate:show

# Seed initial data (users, divisions, service units)
pnpm seed:run
```

### 4. Database Management Commands

```bash
# Migration Management
pnpm migrate              # Run pending migrations
pnpm migrate:revert       # Revert last migration
pnpm migrate:show         # Show migration status
pnpm migrate:create       # Create new migration

# Data Management
pnpm seed:run             # Run seeders
pnpm db:clear             # Clear all data
pnpm db:fresh             # Clear + migrate + seed
pnpm db:soft-fresh        # Clear data only + migrate + seed

# Development Reset
pnpm db:reset             # Complete database reset
```

## 🚀 Running the Application

### Development Mode

```bash
# Start development server with hot reload
pnpm dev

# The server will start on http://localhost:4601
# API routes available at http://localhost:4601/api/v1/
```

### Production Mode

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Available Scripts

```bash
# Development
pnpm dev                  # Start development server
pnpm build                # Build for production
pnpm start                # Start production server

# Database
pnpm migrate              # Run database migrations
pnpm seed:run             # Run database seeders
pnpm db:fresh             # Fresh database setup

# Code Quality
pnpm lint                 # Run ESLint
pnpm lint:fix             # Fix ESLint issues
pnpm format               # Format code with Prettier

# Docker
docker-compose up -d      # Start database services
docker-compose down       # Stop all services
docker-compose logs       # View service logs
```

## 📚 API Documentation

### Base URL
```
http://localhost:4601/api/v1
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```bash
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication
```bash
POST /auth/register       # Register new user
POST /auth/login          # User login
POST /auth/refresh        # Refresh access token
POST /auth/logout         # User logout
```

#### User Management
```bash
GET  /users               # List users (Admin only)
GET  /users/:id           # Get user details
PUT  /users/:id           # Update user
DELETE /users/:id         # Delete user (Admin only)
```

#### Service Units
```bash
GET  /service-units       # List service units
POST /service-units       # Create service unit (Admin)
GET  /service-units/:id   # Get service unit details
PUT  /service-units/:id   # Update service unit (Admin)
```

#### Appointments
```bash
GET  /appointments        # List appointments
POST /appointments        # Create appointment
GET  /appointments/:id    # Get appointment details
PUT  /appointments/:id    # Update appointment
DELETE /appointments/:id  # Cancel appointment
```

#### Citizens (GN Officers)
```bash
GET  /citizens/preview/:nic    # Preview external citizen data
POST /citizens                 # Add new citizen
GET  /citizens/my-division     # List division citizens
GET  /citizens/search          # Search citizens
GET  /citizens/:nic            # Get citizen details
PATCH /citizens/:nic           # Update citizen
PATCH /citizens/:nic/verify    # Verify citizen
```

### Example API Calls

#### Register Admin User
```bash
curl -X POST http://localhost:4601/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@gov.lk",
    "password": "SecurePass123!",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "Admin"
  }'
```

#### Login
```bash
curl -X POST http://localhost:4601/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "SecurePass123!"
  }'
```

#### Add Citizen (GN Officer)
```bash
curl -X POST http://localhost:4601/api/v1/citizens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "nic": "199512345678",
    "displayName": "Janaka Bandara",
    "phoneNumber": "+94771234567",
    "email": "janaka@example.com",
    "address": "123, Main Street, Colombo 03"
  }'
```

## 📁 Project Structure

```
├── 📄 index.ts                 # Application entry point
├── 📁 src/
│   ├── 📁 config/              # Configuration files
│   │   └── 📄 config.ts        # App configuration
│   ├── 📁 core/                # Core utilities
│   │   ├── 📄 cors.ts          # CORS configuration
│   │   ├── 📄 logger.ts        # Logging setup
│   │   ├── 📁 errors/          # Error handling
│   │   └── 📁 responses/       # Response formatters
│   ├── 📁 database/            # Database configuration
│   │   ├── 📄 index.ts         # Database connection
│   │   ├── 📁 entities/        # TypeORM entities
│   │   ├── 📁 migrations/      # Database migrations
│   │   ├── 📁 seeders/         # Data seeders
│   │   └── 📁 dummy/           # Test data
│   ├── 📁 middleware/          # Express middleware
│   │   ├── 📄 auth.ts          # Authentication middleware
│   │   └── 📄 validator.ts     # Validation middleware
│   ├── 📁 modules/             # Feature modules
│   │   ├── 📁 auth/            # Authentication module
│   │   ├── 📁 users/           # User management
│   │   ├── 📁 service-units/   # Service unit management
│   │   ├── 📁 appointments/    # Appointment system
│   │   ├── 📁 citizens/        # Citizen management
│   │   └── 📁 hello/           # Example module
│   └── 📁 types/               # TypeScript type definitions
├── 📄 docker-compose.yaml      # Docker services
├── 📄 package.json             # Dependencies and scripts
├── 📄 tsconfig.json            # TypeScript configuration
└── 📄 README.md                # This file
```

### Module Structure
Each module follows a consistent pattern:
```
📁 module-name/
├── 📄 controller.ts            # HTTP request handlers
├── 📄 service.ts               # Business logic
├── 📄 schema.ts                # Validation schemas
└── 📄 routes.ts                # Route definitions
```

## 🔄 Development Workflow

### 1. Feature Development
```bash
# Start development environment
docker-compose up -d
pnpm dev

# Make your changes
# The server will auto-reload on file changes
```

### 2. Database Changes
```bash
# Create new migration
pnpm migrate:create src/database/migrations/YourMigrationName

# Edit the migration file
# Run the migration
pnpm migrate
```

### 3. Adding New Modules
```bash
# Create module directory
mkdir src/modules/your-module

# Create module files
touch src/modules/your-module/{controller,service,schema,routes}.ts

# Follow existing module patterns
```

### 4. Code Quality
```bash
# Check code quality
pnpm lint

# Fix issues automatically
pnpm lint:fix

# Format code
pnpm format
```

## 🧪 Testing

### Manual Testing with curl

```bash
# Test server health
curl http://localhost:4601/api/v1/hello

# Run comprehensive citizen management tests
./test/test-citizen-management.sh
```

### Test Data

The system comes with pre-seeded test data:

**Admin User:**
- Username: `admin`
- Email: `admin@gov.lk`
- Password: `SecurePass123!`

**GN Officer:**
- Username: `gn_officer_01`
- Email: `gn01@gov.lk`
- Password: `SecurePass123!`

**Service Units:**
- Various government departments pre-configured
- Ready for appointment booking

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Set production environment
NODE_ENV=production

# Use secure database credentials
# Use strong JWT secrets
# Configure proper CORS origins
```

### 2. Database Migration
```bash
# Build the application
pnpm build

# Run migrations in production
pnpm build:migrate

# Run seeders if needed
pnpm build:seed
```

### 3. Process Management
```bash
# Use PM2 or similar process manager
npm install -g pm2
pm2 start dist/index.js --name "gov-api"
```

### 4. External API Integration

Replace the MockCitizenDataAdapter with real government API:

```typescript
// src/modules/citizens/adapters/RealCitizenDataAdapter.ts
export class RealCitizenDataAdapter implements CitizenDataAdapter {
    async getCitizenDataByNIC(nic: string): Promise<AdapterResponse> {
        // Implement real government API integration
        const response = await fetch(`${process.env.GOVERNMENT_API_URL}/citizens/${nic}`, {
            headers: {
                'Authorization': `Bearer ${process.env.GOVERNMENT_API_KEY}`
            }
        });
        return response.json();
    }
}
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if Docker containers are running
docker-compose ps

# Check database logs
docker-compose logs postgres

# Restart database services
docker-compose restart postgres
```

#### Migration Errors
```bash
# Check migration status
pnpm migrate:show

# Clear and reset database
pnpm db:fresh
```

#### Port Already in Use
```bash
# Kill process using port 4601
lsof -ti:4601 | xargs kill -9

# Or change port in .env file
PORT=4602
```

#### JWT Token Issues
```bash
# Verify JWT secrets are set in .env
# Ensure secrets are at least 32 characters long
# Check token expiration
```

### Debug Mode

```bash
# Enable detailed logging
NODE_ENV=development DEBUG=* pnpm dev
```

### Database Debug

```bash
# Check database tables
docker exec -it postgres_rootcode psql -U your_username -d your_database -c "\dt"

# Check migration status
pnpm migrate:show
```

## 📞 Support

For issues and questions:

1. **Check this README** for common solutions
2. **Review error logs** in the console
3. **Check database status** with Docker commands
4. **Verify environment variables** in `.env` file

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Add proper validation schemas
4. Include error handling
5. Update documentation as needed

---

## 📄 License

MIT License - see LICENSE file for details.

---

**🎉 Happy Coding! Your government appointment system is ready to serve citizens efficiently.**
