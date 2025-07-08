const InventoryItem = require('../models/InventoryItem');
const { findSimilarParts } = require('../utils/partNumberExtractor');

class InventoryService {
    static async searchParts(userId, partNumbers) {
        try {
            // Search for exact matches first
            const exactMatches = await InventoryItem.searchPartNumbers(userId, partNumbers);
            
            // Group by part number
            const results = {};
            
            // Initialize results for all requested parts
            partNumbers.forEach(partNumber => {
                results[partNumber] = {
                    exact: [],
                    similar: [],
                    found: false
                };
            });
            
            // Add exact matches
            exactMatches.forEach(item => {
                results[item.part_number].exact.push(item);
                results[item.part_number].found = true;
            });
            
            // For parts not found, try fuzzy matching
            const notFoundParts = partNumbers.filter(pn => !results[pn].found);
            if (notFoundParts.length > 0) {
                // Get all inventory parts for similarity comparison
                const allParts = await InventoryItem.findByUserId(userId, { limit: 1000 });
                const allPartNumbers = [...new Set(allParts.map(item => item.part_number))];
                
                notFoundParts.forEach(searchPart => {
                    const similar = findSimilarParts(searchPart, allPartNumbers, 0.8);
                    if (similar.length > 0) {
                        // Get the actual inventory items for similar parts
                        const similarPartNumbers = similar.slice(0, 5).map(s => s.part);
                        const similarItems = allParts.filter(item => 
                            similarPartNumbers.includes(item.part_number)
                        );
                        results[searchPart].similar = similarItems;
                    }
                });
            }
            
            return results;
        } catch (error) {
            console.error('Error searching parts:', error);
            throw error;
        }
    }
    
    static async processExcelData(worksheetData, sourceSheet) {
        const { values, rowCount, columnCount } = worksheetData;
        
        if (!values || rowCount === 0) {
            return [];
        }
        
        // Assume first row contains headers
        const headers = values[0];
        const items = [];
        
        // Find column indices (case-insensitive)
        const findColumnIndex = (possibleNames) => {
            return headers.findIndex(header => 
                possibleNames.some(name => 
                    header?.toString().toLowerCase().includes(name.toLowerCase())
                )
            );
        };
        
        const partNumberIndex = findColumnIndex(['part', 'number', 'part number', 'p/n', 'pn', 'sku']);
        const descriptionIndex = findColumnIndex(['description', 'desc', 'details', 'name']);
        const locationIndex = findColumnIndex(['location', 'loc', 'bin', 'shelf', 'position']);
        const quantityIndex = findColumnIndex(['quantity', 'qty', 'stock', 'count', 'available']);
        
        // Process data rows
        for (let i = 1; i < rowCount; i++) {
            const row = values[i];
            
            // Skip empty rows
            if (!row || row.every(cell => !cell)) continue;
            
            const partNumber = row[partNumberIndex]?.toString().trim();
            
            // Skip rows without part numbers
            if (!partNumber) continue;
            
            const item = {
                part_number: partNumber.toUpperCase(),
                description: row[descriptionIndex]?.toString().trim() || '',
                location: row[locationIndex]?.toString().trim() || '',
                quantity: parseInt(row[quantityIndex]) || 0,
                source_sheet: sourceSheet
            };
            
            items.push(item);
        }
        
        return items;
    }
    
    static async syncExcelFile(userId, fileId, worksheetName, sourceSheet, graphClient) {
        try {
            // Get worksheet data
            const worksheetData = await graphClient.getWorksheetData(fileId, worksheetName);
            
            // Process the data
            const items = await this.processExcelData(worksheetData, sourceSheet);
            
            // Bulk update inventory
            const result = await InventoryItem.bulkCreate(userId, items, sourceSheet, fileId);
            
            return {
                success: true,
                itemsProcessed: result.count,
                sourceSheet,
                worksheetName
            };
        } catch (error) {
            console.error('Error syncing Excel file:', error);
            throw error;
        }
    }
    
    static async syncAllExcelFiles(userId, graphClient) {
        const results = {
            accurate: null,
            inaccurate: null,
            errors: []
        };
        
        try {
            // Search for inventory Excel files
            const files = await graphClient.listDriveFiles({
                search: 'inventory'
            });
            
            // Look for accurate and inaccurate sheets
            const accurateFile = files.find(file => 
                file.name.toLowerCase().includes('accurate') && 
                file.name.endsWith('.xlsx')
            );
            
            const inaccurateFile = files.find(file => 
                file.name.toLowerCase().includes('inaccurate') && 
                file.name.endsWith('.xlsx')
            );
            
            // Sync accurate sheet
            if (accurateFile) {
                try {
                    const worksheets = await graphClient.getWorksheetNames(accurateFile.id);
                    const firstWorksheet = worksheets[0]?.name || 'Sheet1';
                    
                    results.accurate = await this.syncExcelFile(
                        userId,
                        accurateFile.id,
                        firstWorksheet,
                        'accurate',
                        graphClient
                    );
                } catch (error) {
                    results.errors.push({
                        file: 'accurate',
                        error: error.message
                    });
                }
            }
            
            // Sync inaccurate sheet
            if (inaccurateFile) {
                try {
                    const worksheets = await graphClient.getWorksheetNames(inaccurateFile.id);
                    const firstWorksheet = worksheets[0]?.name || 'Sheet1';
                    
                    results.inaccurate = await this.syncExcelFile(
                        userId,
                        inaccurateFile.id,
                        firstWorksheet,
                        'inaccurate',
                        graphClient
                    );
                } catch (error) {
                    results.errors.push({
                        file: 'inaccurate',
                        error: error.message
                    });
                }
            }
            
            return results;
        } catch (error) {
            console.error('Error syncing all Excel files:', error);
            throw error;
        }
    }
    
    static generateInventoryReport(searchResults) {
        const report = {
            summary: {
                totalRequested: Object.keys(searchResults).length,
                totalFound: 0,
                totalNotFound: 0,
                totalWithSimilar: 0
            },
            details: []
        };
        
        Object.entries(searchResults).forEach(([partNumber, result]) => {
            const detail = {
                partNumber,
                status: 'not_found',
                locations: [],
                totalQuantity: 0,
                suggestions: []
            };
            
            if (result.exact.length > 0) {
                detail.status = 'found';
                report.summary.totalFound++;
                
                result.exact.forEach(item => {
                    detail.locations.push({
                        location: item.location,
                        quantity: item.quantity,
                        source: item.source_sheet,
                        description: item.description
                    });
                    detail.totalQuantity += item.quantity;
                });
            } else if (result.similar.length > 0) {
                detail.status = 'similar_found';
                report.summary.totalWithSimilar++;
                
                result.similar.forEach(item => {
                    detail.suggestions.push({
                        partNumber: item.part_number,
                        description: item.description,
                        location: item.location,
                        quantity: item.quantity,
                        source: item.source_sheet
                    });
                });
            } else {
                report.summary.totalNotFound++;
            }
            
            report.details.push(detail);
        });
        
        return report;
    }
}

module.exports = InventoryService;