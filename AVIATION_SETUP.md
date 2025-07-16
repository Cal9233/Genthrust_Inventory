# Aviation Inventory Integration Setup Guide

This guide explains how to set up and run the integrated inventory management system that combines:
1. Excel-based inventory from OneDrive (original system)
2. MySQL-based aviation inventory database (new system)

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- PostgreSQL (optional, for full email/quote functionality)

## Backend Setup

### 1. Configure MySQL Database

Make sure your MySQL server is running and you have access to the `aviation_inventory` database as described in CLAUDE_README.md.

### 2. Update Environment Variables

Edit `/backend/.env` and set your MySQL credentials:

```env
# MySQL Database (for Aviation Inventory)
MYSQL_HOST=localhost
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=aviation_inventory
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Start the Backend Server

```bash
npm run dev
```

The server will start on http://localhost:3001

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Frontend

```bash
npm start
```

The application will open at http://localhost:3000

## Features Available

### Dashboard
- View stats from both Excel inventory and Aviation database
- Quick links to all inventory systems
- Real-time metrics including:
  - Total aircraft parts
  - Inventory items with serial numbers
  - Pending purchase orders
  - Low stock alerts

### Aviation Inventory Page
- Browse all aircraft parts with serial numbers
- Filter by:
  - Part number/description
  - Condition code (NS, OH, RP, AR, SV, NE)
  - Bin location
- View detailed information:
  - Part specifications
  - Serial numbers
  - Condition status
  - Owner/consignment status
  - Expiry dates

### API Endpoints

The backend provides these aviation-specific endpoints:

- `GET /api/aviation/parts` - List all aircraft parts
- `GET /api/aviation/inventory` - List inventory items with details
- `GET /api/aviation/inventory/summary` - Get inventory summary with stock levels
- `GET /api/aviation/purchase-orders` - List purchase orders
- `GET /api/aviation/entities` - List customers/vendors
- `GET /api/aviation/stats` - Dashboard statistics

## Testing Without Full Setup

If you don't have MySQL set up, the application will still run with limited functionality:
- Excel-based inventory features will work normally
- Aviation inventory pages will show but won't load data
- You'll see a console warning about MySQL connection

## Troubleshooting

### MySQL Connection Failed
- Verify MySQL is running: `systemctl status mysql`
- Check credentials in `.env` file
- Ensure `aviation_inventory` database exists
- Check user has proper permissions

### Frontend Not Loading Aviation Data
- Check browser console for errors
- Verify backend is running on port 3001
- Check CORS settings match your frontend URL

### Data Not Showing
- Ensure the aviation_inventory database has sample data
- Run the SQL scripts from CLAUDE_README.md if needed
- Check API responses in browser Network tab

## Next Steps

1. **Production Deployment**
   - Set up proper MySQL credentials
   - Configure production database backups
   - Set up SSL certificates
   - Configure proper authentication

2. **Data Migration**
   - Import existing aviation inventory data
   - Map AirData fields to new schema
   - Validate data integrity

3. **Additional Features**
   - Barcode scanning integration
   - PDF report generation
   - Advanced search and filtering
   - Audit trail reporting

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify all services are running
3. Review the CLAUDE_README.md for database details
4. Check API responses in browser developer tools