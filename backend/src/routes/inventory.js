const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const InventoryItem = require('../models/InventoryItem');
const InventoryService = require('../services/inventoryService');

// Search inventory
router.post('/search', authenticateUser, async (req, res) => {
    try {
        const { partNumbers, searchTerm } = req.body;
        
        if (partNumbers && Array.isArray(partNumbers)) {
            // Search for specific part numbers
            const results = await InventoryService.searchParts(req.user.id, partNumbers);
            const report = InventoryService.generateInventoryReport(results);
            
            res.json({
                results,
                report
            });
        } else if (searchTerm) {
            // General search
            const items = await InventoryItem.search(req.user.id, searchTerm);
            res.json({ items });
        } else {
            res.status(400).json({ error: 'Please provide partNumbers array or searchTerm' });
        }
        
    } catch (error) {
        console.error('Inventory search error:', error);
        res.status(500).json({ error: 'Failed to search inventory' });
    }
});

// Get all inventory items
router.get('/items', authenticateUser, async (req, res) => {
    try {
        const { source_sheet, limit = 100, offset = 0 } = req.query;
        
        const items = await InventoryItem.findByUserId(req.user.id, {
            source_sheet,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.json({
            items,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({ error: 'Failed to get inventory items' });
    }
});

// Get single part details
router.get('/parts/:partNumber', authenticateUser, async (req, res) => {
    try {
        const items = await InventoryItem.findByPartNumber(
            req.user.id, 
            req.params.partNumber
        );
        
        if (items.length === 0) {
            return res.status(404).json({ error: 'Part not found' });
        }
        
        res.json({ items });
        
    } catch (error) {
        console.error('Get part error:', error);
        res.status(500).json({ error: 'Failed to get part details' });
    }
});

// Sync inventory from Excel files
router.post('/sync', authenticateUser, async (req, res) => {
    try {
        const results = await InventoryService.syncAllExcelFiles(
            req.user.id,
            req.graphClient
        );
        
        res.json({
            message: 'Inventory sync completed',
            results
        });
        
    } catch (error) {
        console.error('Inventory sync error:', error);
        res.status(500).json({ error: 'Failed to sync inventory' });
    }
});

// Sync specific Excel file
router.post('/sync/file', authenticateUser, async (req, res) => {
    try {
        const { fileId, worksheetName, sourceSheet } = req.body;
        
        if (!fileId || !sourceSheet) {
            return res.status(400).json({ 
                error: 'fileId and sourceSheet are required' 
            });
        }
        
        const result = await InventoryService.syncExcelFile(
            req.user.id,
            fileId,
            worksheetName || 'Sheet1',
            sourceSheet,
            req.graphClient
        );
        
        res.json({
            message: 'File sync completed',
            result
        });
        
    } catch (error) {
        console.error('File sync error:', error);
        res.status(500).json({ error: 'Failed to sync file' });
    }
});

// List available Excel files
router.get('/files', authenticateUser, async (req, res) => {
    try {
        const files = await req.graphClient.listDriveFiles({
            search: 'inventory'
        });
        
        // Filter for Excel files
        const excelFiles = files.filter(file => 
            file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
        );
        
        res.json({ files: excelFiles });
        
    } catch (error) {
        console.error('List files error:', error);
        res.status(500).json({ error: 'Failed to list files' });
    }
});

// Get worksheets for a file
router.get('/files/:fileId/worksheets', authenticateUser, async (req, res) => {
    try {
        const worksheets = await req.graphClient.getWorksheetNames(req.params.fileId);
        res.json({ worksheets });
        
    } catch (error) {
        console.error('Get worksheets error:', error);
        res.status(500).json({ error: 'Failed to get worksheets' });
    }
});

// Get inventory statistics
router.get('/stats', authenticateUser, async (req, res) => {
    try {
        const accurateItems = await InventoryItem.findByUserId(req.user.id, {
            source_sheet: 'accurate',
            limit: 1
        });
        
        const inaccurateItems = await InventoryItem.findByUserId(req.user.id, {
            source_sheet: 'inaccurate',
            limit: 1
        });
        
        // Get counts
        const stats = {
            accurate_count: accurateItems.length,
            inaccurate_count: inaccurateItems.length,
            total_count: accurateItems.length + inaccurateItems.length,
            last_sync: new Date() // This would come from database
        };
        
        res.json({ stats });
        
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get inventory statistics' });
    }
});

module.exports = router;