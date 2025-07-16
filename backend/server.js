require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('./src/config/mysql');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/emails', require('./src/routes/emails'));
app.use('/api/inventory', require('./src/routes/inventory'));
app.use('/api/quotes', require('./src/routes/quotes'));
app.use('/api/aviation', require('./src/routes/aviation'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: { message: 'Route not found' } });
});

// Test MySQL connection and start server
testConnection().then(connected => {
    if (connected) {
        console.log('MySQL database connected successfully');
    } else {
        console.warn('MySQL database connection failed - aviation features may not work');
    }
    
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

module.exports = app;