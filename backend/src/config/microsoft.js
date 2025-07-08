const config = {
    auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        tenantId: process.env.MICROSOFT_TENANT_ID,
        redirectUri: process.env.NODE_ENV === 'production' 
            ? process.env.PRODUCTION_REDIRECT_URI 
            : 'http://localhost:3001/api/auth/callback'
    },
    scopes: [
        'openid',
        'profile',
        'email',
        'offline_access',
        'https://graph.microsoft.com/Mail.Read',
        'https://graph.microsoft.com/Mail.Send',
        'https://graph.microsoft.com/Files.Read',
        'https://graph.microsoft.com/Files.ReadWrite'
    ],
    graphEndpoint: 'https://graph.microsoft.com/v1.0'
};

module.exports = config;