const { parseEmailForParts } = require('../utils/partNumberExtractor');
const Quote = require('../models/Quote');

class EmailParsingService {
    static parseQuoteEmail(email) {
        // Extract sender information
        const senderEmail = email.from?.emailAddress?.address || '';
        const senderName = email.from?.emailAddress?.name || '';
        
        // Parse part numbers from email
        const partNumbers = parseEmailForParts(email);
        
        return {
            emailId: email.id,
            senderEmail,
            senderName,
            subject: email.subject || 'No Subject',
            body: email.body?.content || '',
            bodyPreview: email.bodyPreview || '',
            partNumbers,
            receivedAt: email.receivedDateTime
        };
    }
    
    static async processIncomingEmail(email, userId) {
        try {
            // Check if we've already processed this email
            const existingQuote = await Quote.findByEmailId(email.id);
            if (existingQuote) {
                console.log(`Email ${email.id} already processed`);
                return existingQuote;
            }
            
            // Parse the email
            const parsedEmail = this.parseQuoteEmail(email);
            
            // Only create quote if part numbers were found
            if (parsedEmail.partNumbers.length === 0) {
                console.log(`No part numbers found in email ${email.id}`);
                return null;
            }
            
            // Create new quote
            const quote = await Quote.create({
                user_id: userId,
                email_id: parsedEmail.emailId,
                sender_email: parsedEmail.senderEmail,
                sender_name: parsedEmail.senderName,
                subject: parsedEmail.subject,
                body: parsedEmail.body,
                part_numbers: parsedEmail.partNumbers,
                received_at: parsedEmail.receivedAt
            });
            
            return quote;
        } catch (error) {
            console.error('Error processing email:', error);
            throw error;
        }
    }
    
    static async processBatchEmails(emails, userId) {
        const results = {
            processed: [],
            skipped: [],
            errors: []
        };
        
        for (const email of emails) {
            try {
                const quote = await this.processIncomingEmail(email, userId);
                if (quote) {
                    results.processed.push(quote);
                } else {
                    results.skipped.push({
                        emailId: email.id,
                        reason: 'No part numbers found or already processed'
                    });
                }
            } catch (error) {
                results.errors.push({
                    emailId: email.id,
                    error: error.message
                });
            }
        }
        
        return results;
    }
    
    static extractQuoteContext(email) {
        // Extract additional context that might be useful
        const context = {
            hasAttachments: email.hasAttachments || false,
            importance: email.importance || 'normal',
            isRead: email.isRead || false,
            categories: email.categories || [],
            conversationId: email.conversationId
        };
        
        // Try to identify if it's a quote request
        const quoteKeywords = [
            'quote', 'quotation', 'pricing', 'price', 'cost',
            'availability', 'stock', 'inventory', 'RFQ', 'request for quote'
        ];
        
        const lowerSubject = (email.subject || '').toLowerCase();
        const lowerBody = (email.bodyPreview || '').toLowerCase();
        
        context.isLikelyQuote = quoteKeywords.some(keyword => 
            lowerSubject.includes(keyword) || lowerBody.includes(keyword)
        );
        
        // Extract any reference numbers
        const refPattern = /(?:ref|reference|po|order)[\s#:]*([A-Z0-9-]+)/gi;
        const refMatches = (email.subject + ' ' + email.bodyPreview).match(refPattern);
        if (refMatches) {
            context.referenceNumbers = refMatches.map(match => 
                match.replace(/(?:ref|reference|po|order)[\s#:]*/gi, '').trim()
            );
        }
        
        return context;
    }
    
    static categorizeEmail(email) {
        const subject = (email.subject || '').toLowerCase();
        const body = (email.bodyPreview || '').toLowerCase();
        const combined = subject + ' ' + body;
        
        // Categorization rules
        if (combined.includes('urgent') || combined.includes('asap')) {
            return 'urgent';
        }
        if (combined.includes('follow up') || combined.includes('followup')) {
            return 'follow_up';
        }
        if (combined.includes('rfq') || combined.includes('request for quote')) {
            return 'rfq';
        }
        if (combined.includes('order') || combined.includes('purchase')) {
            return 'order';
        }
        
        return 'general';
    }
}

module.exports = EmailParsingService;