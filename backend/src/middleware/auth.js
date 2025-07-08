const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MicrosoftGraphService = require('../services/microsoftGraphService');

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Check if Microsoft token needs refresh
        if (user.token_expires_at && new Date(user.token_expires_at) <= new Date()) {
            try {
                const newTokens = await MicrosoftGraphService.refreshAccessToken(user.refresh_token);
                const updatedUser = await User.updateTokens(user.id, {
                    access_token: newTokens.access_token,
                    refresh_token: newTokens.refresh_token,
                    token_expires_at: new Date(Date.now() + (newTokens.expires_in * 1000))
                });
                req.user = updatedUser;
            } catch (error) {
                console.error('Token refresh failed:', error);
                return res.status(401).json({ error: 'Token refresh failed' });
            }
        } else {
            req.user = user;
        }

        // Attach Microsoft Graph client to request
        req.graphClient = new MicrosoftGraphService(req.user.access_token);
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(500).json({ error: 'Authentication failed' });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (user) {
            req.user = user;
            req.graphClient = new MicrosoftGraphService(user.access_token);
        }
        
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

module.exports = {
    authenticateUser,
    optionalAuth
};