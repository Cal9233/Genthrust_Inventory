// Multiple regex patterns to match various part number formats
const partNumberPatterns = [
    // Format: ABC-123, AB-1234, etc.
    /\b[A-Z]{2,}[-][0-9]{2,}\b/g,
    
    // Format: ABC123, AB1234, etc.
    /\b[A-Z]{2,}[0-9]{3,}\b/g,
    
    // Format: 123-ABC, 1234-AB, etc.
    /\b[0-9]{3,}[-][A-Z]{2,}\b/g,
    
    // Format: A1B2C3
    /\b(?:[A-Z][0-9]){2,}\b/g,
    
    // Format: 12-34-56 or 12.34.56
    /\b[0-9]{2,}[-\.][0-9]{2,}[-\.][0-9]{2,}\b/g,
    
    // Format: ABC-123-XYZ
    /\b[A-Z]{2,}[-][0-9]{2,}[-][A-Z]{2,}\b/g,
    
    // Format: P/N: 12345 or PN:12345
    /\b(?:P\/N|PN|Part\s*Number)[\s:]+([A-Z0-9-]+)\b/gi,
    
    // Format: #12345 or No.12345
    /\b(?:#|No\.?)\s*([A-Z0-9-]+)\b/gi
];

// Common words to exclude from part number detection
const excludePatterns = [
    'USD', 'USA', 'EUR', 'GBP', 'CAD', // Currency codes
    'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', // Days
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', // Months
    'AM', 'PM', 'EST', 'PST', 'GMT', 'UTC', // Time zones
    'LLC', 'INC', 'CORP', 'LTD', 'CO', // Company suffixes
    'WWW', 'HTTP', 'HTTPS', 'COM', 'NET', 'ORG', // Web-related
    'PDF', 'DOC', 'XLS', 'ZIP', 'PNG', 'JPG' // File extensions
];

function extractPartNumbers(text) {
    if (!text) return [];
    
    const foundParts = new Set();
    
    // Convert to uppercase for consistent matching
    const upperText = text.toUpperCase();
    
    // Apply each pattern
    partNumberPatterns.forEach(pattern => {
        const matches = upperText.match(pattern) || [];
        matches.forEach(match => {
            // Clean up the match
            let partNumber = match.trim();
            
            // Extract from P/N: format if needed
            const pnMatch = match.match(/(?:P\/N|PN|Part\s*Number)[\s:]+([A-Z0-9-]+)/i);
            if (pnMatch) {
                partNumber = pnMatch[1];
            }
            
            // Extract from # or No. format
            const numMatch = match.match(/(?:#|No\.?)\s*([A-Z0-9-]+)/i);
            if (numMatch) {
                partNumber = numMatch[1];
            }
            
            // Skip if it's in the exclude list
            if (!excludePatterns.includes(partNumber)) {
                // Additional validation
                if (partNumber.length >= 3 && partNumber.length <= 30) {
                    foundParts.add(partNumber);
                }
            }
        });
    });
    
    return Array.from(foundParts);
}

function parseEmailForParts(email) {
    const parts = [];
    
    // Extract from subject
    if (email.subject) {
        parts.push(...extractPartNumbers(email.subject));
    }
    
    // Extract from body
    if (email.body?.content) {
        // Remove HTML tags if present
        const plainText = email.body.content.replace(/<[^>]*>/g, ' ');
        parts.push(...extractPartNumbers(plainText));
    }
    
    // Remove duplicates
    return [...new Set(parts)];
}

// Validate part number format
function isValidPartNumber(partNumber) {
    // Must be at least 3 characters
    if (!partNumber || partNumber.length < 3) return false;
    
    // Must contain at least one letter and one number
    const hasLetter = /[A-Z]/i.test(partNumber);
    const hasNumber = /[0-9]/.test(partNumber);
    
    return hasLetter && hasNumber;
}

// Find similar part numbers (for fuzzy matching)
function findSimilarParts(searchPart, inventoryParts, threshold = 0.8) {
    const similar = [];
    const searchUpper = searchPart.toUpperCase();
    
    inventoryParts.forEach(invPart => {
        const invUpper = invPart.toUpperCase();
        
        // Exact match
        if (searchUpper === invUpper) {
            similar.push({ part: invPart, score: 1.0 });
            return;
        }
        
        // Calculate similarity score
        const score = calculateSimilarity(searchUpper, invUpper);
        if (score >= threshold) {
            similar.push({ part: invPart, score });
        }
    });
    
    return similar.sort((a, b) => b.score - a.score);
}

// Simple similarity calculation (Levenshtein distance based)
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

// Levenshtein distance calculation
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

module.exports = {
    extractPartNumbers,
    parseEmailForParts,
    isValidPartNumber,
    findSimilarParts,
    partNumberPatterns,
    excludePatterns
};