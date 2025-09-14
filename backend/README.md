# IDURAR ERP CRM Backend Setup Guide

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- MongoDB (local installation or cloud service)
- npm or pnpm

### Installation

1. **Install Dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Environment Setup**

   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env file with your configuration
   nano .env  # or your preferred editor
   ```

3. **Required Environment Variables**

   ```bash
   DATABASE=mongodb://localhost:27017/idurar
   JWT_SECRET=your_super_secure_jwt_secret_key
   ```

4. **Generate Secure JWT Secret** (Recommended)

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. **Initialize Database**

   ```bash
   npm run setup
   ```

6. **Start Development Server**

   ```bash
   npm run dev
   ```

## Available Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `npm start` | Production server | `npm start` |
| `npm run dev` | Development server with auto-reload | `npm run dev` |
| `npm run setup` | Initialize database with default data | `npm run setup` |
| `npm run reset` | Reset database (removes all data) | `npm run reset` |
| `npm run upgrade` | Run database migrations | `npm run upgrade` |
| `npm run prod` | Start in production mode | `npm run prod` |
| `npm run test:env` | Test environment variable loading | `npm run test:env` |

## Environment Configuration

### Development Environment

```bash
# Basic required configuration
DATABASE=mongodb://localhost:27017/idurar
JWT_SECRET=your_development_jwt_secret
NODE_ENV=development
PORT=8888
PUBLIC_SERVER_FILE=http://localhost:8888/
```

### Production Environment

```bash
# Production configuration
DATABASE=mongodb://username:password@production-host:27017/idurar
JWT_SECRET=your_super_secure_production_jwt_secret
NODE_ENV=production
PORT=8888
PUBLIC_SERVER_FILE=https://api.yourcompany.com/

# Optional services
RESEND_API=re_your_resend_api_key
OPENAI_API_KEY=sk_your_openai_api_key
```

## Database Setup

### Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/idurar`

### MongoDB Atlas (Cloud)

1. Create MongoDB Atlas account
2. Create cluster and database
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/idurar`
4. Add your IP to whitelist

### Docker MongoDB

```bash
docker run --name idurar-mongo -p 27017:27017 -d mongo:latest
```

## Initial Setup

### 1. Database Initialization

```bash
npm run setup
```

This creates:

- Default admin user (<admin@admin.com> / admin123)
- Default settings
- Required collections

### 2. Reset Database (if needed)

```bash
npm run reset
npm run setup
```

## API Endpoints

Once running, your API will be available at:

- **Base URL**: <http://localhost:8888>
- **API Routes**: <http://localhost:8888/api>
- **File Uploads**: <http://localhost:8888/public/uploads>

## Troubleshooting

### Common Issues

#### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongosh  # or mongo

# Verify connection string in .env
DATABASE=mongodb://localhost:27017/idurar
```

#### JWT Secret Missing

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Port Already in Use

```bash
# Change port in .env
PORT=8889

# Or kill process using port 8888
lsof -ti:8888 | xargs kill
```

#### Environment Variables Not Loading

```bash
# Test environment loading
npm run test:env

# Check .env file exists and has correct format
ls -la .env
cat .env
```

## Security Best Practices

1. **Never commit .env files** - They're already in .gitignore
2. **Use strong JWT secrets** - Generate with crypto.randomBytes()
3. **Set NODE_ENV=production** in production
4. **Use HTTPS** in production environments
5. **Restrict MongoDB access** with proper authentication
6. **Regular security updates** - Keep dependencies updated

## File Structure

```bash
backend/
├── .env.example          # Environment template
├── src/
│   ├── server.js         # Main server file
│   ├── app.js           # Express app configuration
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── controllers/     # Business logic
│   ├── middlewares/     # Custom middleware
│   └── setup/           # Database setup scripts
└── package.json         # Dependencies and scripts
```

## Support

- Check logs for detailed error messages
- Ensure all required environment variables are set
- Verify MongoDB connection and permissions
- Review .env.example for configuration reference
