# Genthrust Inventory Management - Complete Setup Instructions

## Overview
This application automates inventory quote processing by monitoring your Microsoft Outlook emails, extracting part numbers, searching inventory in Excel files stored in OneDrive, and sending automated responses.

## What's Been Built
- ✅ Complete backend API with Node.js/Express
- ✅ PostgreSQL database schema
- ✅ Microsoft Graph API integration
- ✅ Email parsing with part number extraction
- ✅ React frontend with TypeScript
- ✅ Authentication flow
- ✅ Responsive UI with Tailwind CSS

## What You Need to Do

### 1. Push Code to GitHub
```bash
cd /var/www/cal.lueshub.com/inventory-management-app

# Option A: Using HTTPS (recommended)
git remote set-url origin https://github.com/Cal9233/Genthrust_Inventory.git
git push -u origin main
# Enter your GitHub username and Personal Access Token when prompted

# Option B: Using SSH (if you have SSH keys set up)
git push -u origin main
```

### 2. Microsoft Azure Setup (REQUIRED)

1. **Go to Azure Portal**
   - Visit https://portal.azure.com
   - Sign in with your Microsoft account

2. **Create App Registration**
   - Navigate to "Azure Active Directory" → "App registrations"
   - Click "New registration"
   - Fill in:
     - Name: `Genthrust Inventory Manager`
     - Supported account types: "Accounts in this organizational directory only"
     - Redirect URI: 
       - Type: Web
       - URI: `http://localhost:3001/api/auth/callback` (for development)
   - Click "Register"

3. **Save Your Credentials**
   - Copy the "Application (client) ID" - you'll need this
   - Copy the "Directory (tenant) ID" - you'll need this too

4. **Create Client Secret**
   - Go to "Certificates & secrets" → "Client secrets"
   - Click "New client secret"
   - Description: "Inventory App Secret"
   - Expires: Choose your preference
   - Click "Add"
   - **IMPORTANT**: Copy the secret value immediately (you can't see it again!)

5. **Configure API Permissions**
   - Go to "API permissions"
   - Click "Add a permission" → "Microsoft Graph"
   - Select "Delegated permissions"
   - Add these permissions:
     - `Mail.Read` - Read user mail
     - `Mail.Send` - Send mail as user
     - `Files.Read` - Read user files
     - `Files.ReadWrite` - Read and write user files
     - `User.Read` - Sign in and read user profile
   - Click "Add permissions"
   - **IMPORTANT**: Click "Grant admin consent" button

### 3. PostgreSQL Database Setup

1. **Install PostgreSQL** (if not already installed)
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib

   # macOS
   brew install postgresql
   brew services start postgresql
   ```

2. **Create Database**
   ```bash
   sudo -u postgres psql
   ```
   Then run:
   ```sql
   CREATE DATABASE inventory_management;
   CREATE USER inventory_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE inventory_management TO inventory_user;
   \q
   ```

### 4. Configure the Application

1. **Backend Configuration**
   ```bash
   cd /var/www/cal.lueshub.com/inventory-management-app/backend
   cp .env.example .env
   ```
   
   Edit `.env` with your actual values:
   ```env
   # Microsoft Azure (from Step 2)
   MICROSOFT_CLIENT_ID=your_application_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret_value
   MICROSOFT_TENANT_ID=your_directory_tenant_id

   # Database (from Step 3)
   DATABASE_URL=postgresql://inventory_user:your_secure_password@localhost:5432/inventory_management

   # Security
   JWT_SECRET=generate_a_random_32_character_string_here

   # Server
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   NODE_ENV=development
   ```

2. **Frontend Configuration**
   ```bash
   cd /var/www/cal.lueshub.com/inventory-management-app/frontend
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

### 5. Prepare Your Excel Files

1. **Create Excel Inventory Files in OneDrive**
   
   Create two Excel files in your OneDrive root folder:
   - `inventory_accurate.xlsx` - For verified inventory
   - `inventory_inaccurate.xlsx` - For unverified inventory

2. **Excel File Format**
   
   Each file should have these columns (first row as headers):
   | Part Number | Description | Location | Quantity |
   |-------------|-------------|----------|----------|
   | ABC-123     | Widget A    | A1-B2    | 50       |
   | DEF-456     | Gadget B    | C3-D4    | 25       |

### 6. Run the Application

1. **Initialize Database**
   ```bash
   cd /var/www/cal.lueshub.com/inventory-management-app/backend
   npm run db:init
   ```

2. **Start Backend Server**
   ```bash
   cd /var/www/cal.lueshub.com/inventory-management-app/backend
   npm run dev
   ```
   Server will start on http://localhost:3001

3. **Start Frontend** (in a new terminal)
   ```bash
   cd /var/www/cal.lueshub.com/inventory-management-app/frontend
   npm start
   ```
   Application will open at http://localhost:3000

### 7. First Time Setup in App

1. **Login**
   - Go to http://localhost:3000
   - Click "Sign in with Microsoft"
   - Use your Microsoft account credentials
   - Authorize the app permissions

2. **Sync Inventory**
   - Go to "Inventory" page
   - Click "Sync Excel Files"
   - This will import data from your OneDrive Excel files

3. **Sync Emails**
   - Go to "Quotes" page
   - Click "Sync Emails"
   - This will fetch emails containing quotes/part requests

## How the App Works

### Email Processing Flow
1. **Email Sync**: Fetches emails from Outlook containing keywords like "quote", "pricing", "availability"
2. **Part Extraction**: Uses regex patterns to find part numbers like:
   - ABC-123
   - DEF456
   - 12-34-56
   - P/N: 12345
3. **Inventory Search**: Searches your Excel data for exact and similar matches
4. **Response Generation**: Creates email responses based on availability

### Email Templates
- **Parts Found**: All requested parts are in stock
- **Parts Not Found**: None of the parts are available
- **Mixed Results**: Some parts found, others not
- **Custom**: Write your own response

### Part Number Patterns Recognized
```
ABC-123     (letters-numbers)
ABC123      (letters followed by numbers)
123-ABC     (numbers-letters)
A1B2C3      (alternating letters/numbers)
12-34-56    (number groups)
P/N: 12345  (with prefix)
#12345      (with hash)
```

## Troubleshooting

### Common Issues

1. **"No authorization code provided" error**
   - Check redirect URI matches exactly in Azure
   - Ensure you're using the correct tenant ID

2. **Database connection failed**
   - Verify PostgreSQL is running: `sudo service postgresql status`
   - Check database credentials in .env

3. **Excel sync not working**
   - Ensure Excel files are in OneDrive root folder
   - Check file names match exactly
   - Verify Files.Read permission is granted

4. **Emails not syncing**
   - Check Mail.Read permission is granted
   - Verify you have emails with quote-related keywords

### Testing the Setup

1. **Test Email Parsing**
   - Send yourself an email with subject "Quote Request"
   - Include body text like: "Please quote parts ABC-123 and DEF-456"
   - Sync emails and check if it appears

2. **Test Inventory Search**
   - Add test data to your Excel files
   - Sync inventory
   - Search for the part numbers

## Production Deployment

### For Production Azure Setup
1. Add production redirect URI: `https://yourdomain.com/api/auth/callback`
2. Update CORS_ORIGIN in backend .env
3. Use environment variables for all secrets

### Deployment Options
- **Backend**: Railway, Heroku, or AWS
- **Frontend**: Vercel, Netlify, or AWS S3
- **Database**: PostgreSQL on Railway, Amazon RDS, or DigitalOcean

## Support

If you encounter issues:
1. Check the browser console for frontend errors
2. Check backend terminal for API errors
3. Verify all environment variables are set correctly
4. Ensure all Azure permissions are granted

## Next Steps
1. Complete all setup steps above
2. Test with sample emails and inventory data
3. Customize email templates as needed
4. Add more part number patterns if required
5. Deploy to production when ready