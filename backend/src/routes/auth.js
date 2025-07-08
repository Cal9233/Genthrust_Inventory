const express = require('express');
const router = express.Router();
const MicrosoftGraphService = require('../services/microsoftGraphService');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { authenticateUser } = require('../middleware/auth');

// Initiate OAuth flow
router.get('/login', (req, res) => {
    const state = req.query.state || '';
    const authUrl = MicrosoftGraphService.getAuthUrl(state);
    res.json({ authUrl });
});

// OAuth callback
router.get('/callback', async (req, res) => {
    try {
        const { code, state, error } = req.query;
        
        if (error) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/error?message=${encodeURIComponent(error)}`);
        }
        
        if (!code) {
            return res.status(400).json({ error: 'No authorization code provided' });
        }
        
        // Exchange code for tokens
        const tokens = await MicrosoftGraphService.exchangeCodeForToken(code);
        
        // Get user profile from Microsoft Graph
        const graphClient = new MicrosoftGraphService(tokens.access_token);
        const profile = await graphClient.getUserProfile();
        
        // Find or create user
        let user = await User.findByMicrosoftId(profile.id);
        
        if (!user) {
            user = await User.create({
                microsoft_id: profile.id,
                email: profile.mail || profile.userPrincipalName,
                name: profile.displayName,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                token_expires_at: new Date(Date.now() + (tokens.expires_in * 1000))
            });
        } else {
            // Update tokens
            user = await User.updateTokens(user.id, {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                token_expires_at: new Date(Date.now() + (tokens.expires_in * 1000))
            });
        }
        
        // Generate JWT
        const jwt = generateToken(user.id);
        
        // Redirect to frontend with token
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/success?token=${jwt}`;
        res.redirect(redirectUrl);
        
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
});

// Get current user profile
router.get('/me', authenticateUser, async (req, res) => {
    try {
        const user = {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            microsoft_id: req.user.microsoft_id
        };
        
        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }
        
        // This would typically validate the refresh token and issue new tokens
        // For now, we'll just return an error
        res.status(501).json({ error: 'Token refresh not implemented' });
        
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

// Logout
router.post('/logout', authenticateUser, async (req, res) => {
    try {
        // In a production app, you might want to invalidate the token
        // For now, we'll just return success
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Failed to logout' });
    }
});

module.exports = router;