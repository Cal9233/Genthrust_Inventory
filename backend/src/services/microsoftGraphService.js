require('isomorphic-fetch');
const { Client } = require('@microsoft/microsoft-graph-client');
const config = require('../config/microsoft');

class MicrosoftGraphService {
    constructor(accessToken) {
        this.client = Client.init({
            authProvider: (done) => {
                done(null, accessToken);
            }
        });
    }

    // Email operations
    async getEmails(options = {}) {
        const { filter, top = 50, skip = 0, orderBy = 'receivedDateTime desc' } = options;
        
        let query = this.client
            .api('/me/messages')
            .top(top)
            .skip(skip)
            .orderby(orderBy)
            .select('id,subject,from,receivedDateTime,body,bodyPreview');

        if (filter) {
            query = query.filter(filter);
        }

        try {
            const response = await query.get();
            return response.value;
        } catch (error) {
            console.error('Error fetching emails:', error);
            throw error;
        }
    }

    async getEmailById(emailId) {
        try {
            return await this.client
                .api(`/me/messages/${emailId}`)
                .select('id,subject,from,to,receivedDateTime,body,attachments')
                .get();
        } catch (error) {
            console.error('Error fetching email:', error);
            throw error;
        }
    }

    async sendEmail(emailData) {
        const { to, subject, body, replyTo } = emailData;
        
        const message = {
            message: {
                subject: subject,
                body: {
                    contentType: 'HTML',
                    content: body
                },
                toRecipients: Array.isArray(to) ? to.map(email => ({
                    emailAddress: { address: email }
                })) : [{
                    emailAddress: { address: to }
                }]
            }
        };

        if (replyTo) {
            message.message.replyTo = [{
                emailAddress: { address: replyTo }
            }];
        }

        try {
            return await this.client.api('/me/sendMail').post(message);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    async replyToEmail(emailId, replyData) {
        const { comment, replyAll = false } = replyData;
        
        const endpoint = replyAll ? 
            `/me/messages/${emailId}/replyAll` : 
            `/me/messages/${emailId}/reply`;

        try {
            return await this.client.api(endpoint).post({
                comment: comment
            });
        } catch (error) {
            console.error('Error replying to email:', error);
            throw error;
        }
    }

    // Excel/OneDrive operations
    async listDriveFiles(options = {}) {
        const { filter, search } = options;
        
        let query = this.client.api('/me/drive/root/children');

        if (search) {
            query = this.client.api(`/me/drive/root/search(q='${search}')`);
        }

        if (filter) {
            query = query.filter(filter);
        }

        try {
            const response = await query.get();
            return response.value;
        } catch (error) {
            console.error('Error listing drive files:', error);
            throw error;
        }
    }

    async getExcelWorkbook(fileId) {
        try {
            return await this.client
                .api(`/me/drive/items/${fileId}/workbook`)
                .get();
        } catch (error) {
            console.error('Error getting workbook:', error);
            throw error;
        }
    }

    async getWorksheetNames(fileId) {
        try {
            const response = await this.client
                .api(`/me/drive/items/${fileId}/workbook/worksheets`)
                .select('name,id')
                .get();
            return response.value;
        } catch (error) {
            console.error('Error getting worksheet names:', error);
            throw error;
        }
    }

    async getWorksheetData(fileId, worksheetIdOrName, range = null) {
        try {
            let endpoint = `/me/drive/items/${fileId}/workbook/worksheets/${worksheetIdOrName}`;
            
            if (range) {
                endpoint += `/range(address='${range}')`;
            } else {
                endpoint += '/usedRange';
            }

            const response = await this.client.api(endpoint).get();
            return {
                values: response.values,
                rowCount: response.rowCount,
                columnCount: response.columnCount
            };
        } catch (error) {
            console.error('Error getting worksheet data:', error);
            throw error;
        }
    }

    // User profile
    async getUserProfile() {
        try {
            return await this.client
                .api('/me')
                .select('id,displayName,mail,userPrincipalName')
                .get();
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    // Token validation
    async validateToken() {
        try {
            await this.getUserProfile();
            return true;
        } catch (error) {
            if (error.statusCode === 401) {
                return false;
            }
            throw error;
        }
    }

    // Static methods for OAuth flow
    static getAuthUrl(state = '') {
        const params = new URLSearchParams({
            client_id: config.auth.clientId,
            response_type: 'code',
            redirect_uri: config.auth.redirectUri,
            response_mode: 'query',
            scope: config.scopes.join(' '),
            state: state
        });

        return `https://login.microsoftonline.com/${config.auth.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
    }

    static async exchangeCodeForToken(code) {
        const tokenEndpoint = `https://login.microsoftonline.com/${config.auth.tenantId}/oauth2/v2.0/token`;
        
        const params = new URLSearchParams({
            client_id: config.auth.clientId,
            client_secret: config.auth.clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: config.auth.redirectUri,
            scope: config.scopes.join(' ')
        });

        try {
            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString()
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Token exchange failed: ${error}`);
            }

            const data = await response.json();
            return {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in,
                token_type: data.token_type
            };
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            throw error;
        }
    }

    static async refreshAccessToken(refreshToken) {
        const tokenEndpoint = `https://login.microsoftonline.com/${config.auth.tenantId}/oauth2/v2.0/token`;
        
        const params = new URLSearchParams({
            client_id: config.auth.clientId,
            client_secret: config.auth.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            scope: config.scopes.join(' ')
        });

        try {
            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString()
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Token refresh failed: ${error}`);
            }

            const data = await response.json();
            return {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in,
                token_type: data.token_type
            };
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw error;
        }
    }
}

module.exports = MicrosoftGraphService;