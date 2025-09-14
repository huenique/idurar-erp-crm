# Environment Configuration Guide

## Quick Setup

### For Local Development

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. The default values should work for local development with backend running on port 8888.

### For Production Deployment

Set these environment variables in your deployment platform:

```bash
# Required
VITE_BACKEND_SERVER=https://your-api-domain.com/
VITE_FRONTEND_URL=https://your-app-domain.com/

# Optional (will default to VITE_BACKEND_SERVER if not set)
VITE_FILE_BASE_URL=https://your-api-domain.com/

# Appwrite Configuration (if using CRM features)
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
VITE_APPWRITE_BUCKET_ID=your-bucket-id
VITE_APPWRITE_API_KEY=your-api-key
VITE_APPWRITE_FUNCTION_ID=your-function-id
VITE_APP_FROM_EMAIL=noreply@yourcompany.com
VITE_USERNAME=admin@yourcompany.com
VITE_PASSWORD=your-secure-password
```

## How It Works

- **Development Mode**: Uses localhost defaults (<http://localhost:8888/> for backend, <http://localhost:3000/> for frontend)
- **Production Mode**: Uses environment variables you set
- **Fallbacks**: If environment variables aren't set, sensible defaults are used

## Environment Variables

| Variable | Purpose | Default | Required |
|----------|---------|---------|----------|
| `VITE_BACKEND_SERVER` | Backend API URL | `http://localhost:8888/` | No |
| `VITE_FRONTEND_URL` | Frontend app URL | `http://localhost:3000/` | No |
| `VITE_FILE_BASE_URL` | File upload/download URL | Same as `VITE_BACKEND_SERVER` | No |

## Migration from Old Config

If you're updating from the previous configuration:

- Remove `VITE_DEV_REMOTE` variable
- Remove `PROD` variable
- Use `VITE_BACKEND_SERVER` for your backend URL
- Add `VITE_FRONTEND_URL` for your frontend URL

The new system is much simpler and follows standard Vite conventions.
