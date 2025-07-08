const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const Quote = require('../models/Quote');
const QuoteResponse = require('../models/QuoteResponse');

// Get quote statistics
router.get('/stats', authenticateUser, async (req, res) => {
    try {
        const quoteStats = await Quote.getStats(req.user.id);
        const responseStats = await QuoteResponse.getStats(req.user.id);
        
        const stats = {
            quotes: {
                pending: parseInt(quoteStats.pending_count),
                processed: parseInt(quoteStats.processed_count),
                responded: parseInt(quoteStats.responded_count),
                total: parseInt(quoteStats.total_count)
            },
            responses: {
                total: parseInt(responseStats.total_responses),
                unique_quotes: parseInt(responseStats.unique_quotes_responded),
                parts_found: parseInt(responseStats.total_parts_found) || 0,
                parts_not_found: parseInt(responseStats.total_parts_not_found) || 0
            },
            response_rate: quoteStats.total_count > 0 
                ? ((parseInt(quoteStats.responded_count) / parseInt(quoteStats.total_count)) * 100).toFixed(1)
                : 0
        };
        
        res.json({ stats });
        
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

// Search quotes by part number
router.get('/search', authenticateUser, async (req, res) => {
    try {
        const { partNumber } = req.query;
        
        if (!partNumber) {
            return res.status(400).json({ error: 'Part number is required' });
        }
        
        const quotes = await Quote.searchByPartNumber(req.user.id, partNumber);
        
        res.json({ quotes });
        
    } catch (error) {
        console.error('Search quotes error:', error);
        res.status(500).json({ error: 'Failed to search quotes' });
    }
});

// Get response history
router.get('/responses', authenticateUser, async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        
        const responses = await QuoteResponse.findByUserId(req.user.id, {
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.json({
            responses,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('Get responses error:', error);
        res.status(500).json({ error: 'Failed to get response history' });
    }
});

// Update quote status
router.patch('/:id/status', authenticateUser, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processed', 'responded'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            });
        }
        
        const quote = await Quote.findById(req.params.id);
        
        if (!quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }
        
        if (quote.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const updatedQuote = await Quote.updateStatus(quote.id, status);
        
        res.json({ quote: updatedQuote });
        
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Failed to update quote status' });
    }
});

// Export quotes data
router.get('/export', authenticateUser, async (req, res) => {
    try {
        const { format = 'json', status } = req.query;
        
        const quotes = await Quote.findByUserId(req.user.id, {
            status,
            limit: 1000 // Reasonable limit for export
        });
        
        if (format === 'csv') {
            // Convert to CSV
            const csv = [
                'ID,Email ID,Sender,Subject,Part Numbers,Status,Received At,Processed At',
                ...quotes.map(q => 
                    `${q.id},"${q.email_id}","${q.sender_email}","${q.subject}","${q.part_numbers.join(';')}","${q.status}","${q.received_at}","${q.processed_at || ''}"`
                )
            ].join('\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="quotes.csv"');
            res.send(csv);
        } else {
            res.json({ quotes });
        }
        
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export quotes' });
    }
});

module.exports = router;