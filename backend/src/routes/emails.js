const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const EmailParsingService = require('../services/emailParsingService');
const Quote = require('../models/Quote');
const QuoteResponse = require('../models/QuoteResponse');
const InventoryService = require('../services/inventoryService');
const { emailTemplates } = require('../utils/emailTemplates');

// Sync emails from Microsoft Graph
router.post('/sync', authenticateUser, async (req, res) => {
    try {
        const { filter, top = 50 } = req.body;
        
        // Build filter for quote-related emails
        const defaultFilter = "contains(subject, 'quote') or contains(subject, 'pricing') or contains(subject, 'availability')";
        const emailFilter = filter || defaultFilter;
        
        // Fetch emails from Microsoft Graph
        const emails = await req.graphClient.getEmails({
            filter: emailFilter,
            top: top
        });
        
        // Process emails
        const results = await EmailParsingService.processBatchEmails(emails, req.user.id);
        
        res.json({
            message: 'Email sync completed',
            results: {
                processed: results.processed.length,
                skipped: results.skipped.length,
                errors: results.errors.length,
                details: results
            }
        });
        
    } catch (error) {
        console.error('Email sync error:', error);
        res.status(500).json({ error: 'Failed to sync emails' });
    }
});

// Get quotes with filters
router.get('/quotes', authenticateUser, async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;
        
        const quotes = await Quote.findByUserId(req.user.id, {
            status,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        const stats = await Quote.getStats(req.user.id);
        
        res.json({
            quotes,
            stats,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: parseInt(stats.total_count)
            }
        });
        
    } catch (error) {
        console.error('Get quotes error:', error);
        res.status(500).json({ error: 'Failed to get quotes' });
    }
});

// Get single quote
router.get('/quotes/:id', authenticateUser, async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id);
        
        if (!quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }
        
        if (quote.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Get any responses for this quote
        const responses = await QuoteResponse.findByQuoteId(quote.id);
        
        // Search inventory for part numbers
        const inventoryResults = await InventoryService.searchParts(req.user.id, quote.part_numbers);
        
        res.json({
            quote,
            responses,
            inventoryResults
        });
        
    } catch (error) {
        console.error('Get quote error:', error);
        res.status(500).json({ error: 'Failed to get quote' });
    }
});

// Process and respond to quote
router.post('/quotes/:id/respond', authenticateUser, async (req, res) => {
    try {
        const { template, customMessage, ccEmails } = req.body;
        const quoteId = req.params.id;
        
        // Get quote
        const quote = await Quote.findById(quoteId);
        if (!quote || quote.user_id !== req.user.id) {
            return res.status(404).json({ error: 'Quote not found' });
        }
        
        // Search inventory
        const searchResults = await InventoryService.searchParts(req.user.id, quote.part_numbers);
        const report = InventoryService.generateInventoryReport(searchResults);
        
        // Prepare email data
        const foundParts = [];
        const notFoundParts = [];
        const similarParts = [];
        
        report.details.forEach(detail => {
            if (detail.status === 'found') {
                detail.locations.forEach(loc => {
                    foundParts.push({
                        part_number: detail.partNumber,
                        description: loc.description,
                        location: loc.location,
                        quantity: loc.quantity,
                        source: loc.source
                    });
                });
            } else if (detail.status === 'not_found') {
                notFoundParts.push(detail.partNumber);
            } else if (detail.status === 'similar_found') {
                similarParts.push(...detail.suggestions);
            }
        });
        
        // Select email template
        let emailContent;
        let emailSubject;
        
        if (template === 'custom' && customMessage) {
            emailSubject = emailTemplates.customTemplate.subject(`Re: ${quote.subject}`);
            emailContent = emailTemplates.customTemplate.body({
                content: customMessage,
                senderName: quote.sender_name
            });
        } else if (foundParts.length > 0 && notFoundParts.length === 0) {
            emailSubject = emailTemplates.partFound.subject(quote.part_numbers);
            emailContent = emailTemplates.partFound.body({
                parts: foundParts,
                senderName: quote.sender_name
            });
        } else if (foundParts.length === 0) {
            emailSubject = emailTemplates.partNotFound.subject(quote.part_numbers);
            emailContent = emailTemplates.partNotFound.body({
                notFoundParts,
                similarParts,
                senderName: quote.sender_name
            });
        } else {
            emailSubject = emailTemplates.mixedResults.subject(quote.part_numbers);
            emailContent = emailTemplates.mixedResults.body({
                foundParts,
                notFoundParts,
                senderName: quote.sender_name
            });
        }
        
        // Send email
        await req.graphClient.sendEmail({
            to: quote.sender_email,
            subject: emailSubject,
            body: emailContent
        });
        
        // Record response
        await QuoteResponse.create({
            quote_id: quote.id,
            user_id: req.user.id,
            response_body: emailContent,
            template_used: template || 'auto',
            parts_found: foundParts.map(p => p.part_number),
            parts_not_found: notFoundParts
        });
        
        // Update quote status
        await Quote.updateStatus(quote.id, 'responded');
        
        res.json({
            message: 'Response sent successfully',
            email: {
                to: quote.sender_email,
                subject: emailSubject
            }
        });
        
    } catch (error) {
        console.error('Send response error:', error);
        res.status(500).json({ error: 'Failed to send response' });
    }
});

// Get email templates
router.get('/templates', authenticateUser, (req, res) => {
    const templates = [
        {
            id: 'partFound',
            name: 'Parts Found',
            description: 'Use when all requested parts are in stock'
        },
        {
            id: 'partNotFound',
            name: 'Parts Not Found',
            description: 'Use when none of the requested parts are in stock'
        },
        {
            id: 'mixedResults',
            name: 'Mixed Results',
            description: 'Use when some parts are found and others are not'
        },
        {
            id: 'custom',
            name: 'Custom Message',
            description: 'Write your own custom response'
        }
    ];
    
    res.json({ templates });
});

module.exports = router;