# Inventory Management App

An automated inventory quote processing system that integrates with Microsoft 365 to monitor emails, extract part numbers, search inventory in Excel files, and send automated responses.

## Features

- **Email Monitoring**: Automatically syncs and processes quote emails from Microsoft Outlook
- **Part Number Extraction**: Uses advanced regex patterns to extract part numbers from emails
- **Excel Integration**: Syncs inventory data from Excel files stored in OneDrive
- **Automated Responses**: Send templated email responses based on inventory availability
- **Real-time Dashboard**: Track quotes, inventory status, and response rates
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL database
- Microsoft Graph API integration
- JWT authentication

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

## Prerequisites

1. **Microsoft Azure App Registration**
   - Go to [Azure Portal](https://portal.azure.com)
   - Create a new App Registration
   - Configure API permissions (Mail.Read, Mail.Send, Files.Read)
   - Note down Client ID, Tenant ID, and create a Client Secret

2. **PostgreSQL Database**
   - Install PostgreSQL 12+
   - Create a new database for the application

3. **Node.js**
   - Install Node.js 16+ and npm

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```env
   MICROSOFT_CLIENT_ID=your_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret
   MICROSOFT_TENANT_ID=your_tenant_id
   DATABASE_URL=postgresql://username:password@localhost:5432/inventory_management
   JWT_SECRET=your_jwt_secret_key
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   ```

4. Initialize the database:
   ```bash
   npm run db:init
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

## Excel File Setup

The application expects two Excel files in your OneDrive:
- `inventory_accurate.xlsx` - Contains verified inventory
- `inventory_inaccurate.xlsx` - Contains unverified inventory

Each Excel file should have columns:
- Part Number
- Description
- Location
- Quantity

## Usage

1. **Login**: Sign in with your Microsoft account
2. **Sync Emails**: Click "Sync Emails" to fetch new quotes
3. **View Quotes**: Browse and filter quotes by status
4. **Search Inventory**: Use the search feature to find parts
5. **Send Responses**: Select a template and send responses to quotes
6. **Sync Inventory**: Update inventory data from Excel files

## API Endpoints

### Authentication
- `GET /api/auth/login` - Get Microsoft login URL
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/me` - Get current user

### Emails & Quotes
- `POST /api/emails/sync` - Sync emails from Outlook
- `GET /api/emails/quotes` - Get all quotes
- `GET /api/emails/quotes/:id` - Get quote details
- `POST /api/emails/quotes/:id/respond` - Send response

### Inventory
- `POST /api/inventory/search` - Search for parts
- `GET /api/inventory/items` - Get all items
- `POST /api/inventory/sync` - Sync from Excel

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
```

## Deployment

### Backend (Railway/Heroku)
1. Set environment variables
2. Deploy using Git push
3. Run database migrations

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variables
3. Deploy

## License

This project is proprietary and confidential.