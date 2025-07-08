const emailTemplates = {
    partFound: {
        subject: (partNumbers) => `Parts Availability - ${partNumbers.join(', ')}`,
        body: (data) => {
            const { parts, senderName, companyName } = data;
            
            let html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Parts Availability Report</h2>
                    <p>Dear ${senderName || 'Customer'},</p>
                    <p>Thank you for your inquiry. Below is the availability information for the requested parts:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">Part Number</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">Description</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">Location</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: right;">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            parts.forEach(part => {
                html += `
                    <tr>
                        <td style="border: 1px solid #dee2e6; padding: 8px;">${part.part_number}</td>
                        <td style="border: 1px solid #dee2e6; padding: 8px;">${part.description || 'N/A'}</td>
                        <td style="border: 1px solid #dee2e6; padding: 8px;">${part.location || 'N/A'}</td>
                        <td style="border: 1px solid #dee2e6; padding: 8px; text-align: right;">${part.quantity}</td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                    
                    <p>Please let us know if you would like to proceed with an order or need any additional information.</p>
                    
                    <p>Best regards,<br>
                    ${companyName || 'Inventory Management Team'}</p>
                </div>
            `;
            
            return html;
        }
    },
    
    partNotFound: {
        subject: (partNumbers) => `Parts Inquiry - ${partNumbers.join(', ')}`,
        body: (data) => {
            const { notFoundParts, similarParts, senderName, companyName } = data;
            
            let html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Parts Availability Update</h2>
                    <p>Dear ${senderName || 'Customer'},</p>
                    <p>Thank you for your inquiry. Unfortunately, the following parts are not currently in our inventory:</p>
                    
                    <ul style="list-style-type: none; padding: 0;">
            `;
            
            notFoundParts.forEach(part => {
                html += `<li style="padding: 5px 0;">❌ ${part}</li>`;
            });
            
            html += `</ul>`;
            
            if (similarParts && similarParts.length > 0) {
                html += `
                    <h3 style="color: #333; margin-top: 20px;">Alternative Parts Available:</h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">Part Number</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">Description</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: right;">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                similarParts.forEach(part => {
                    html += `
                        <tr>
                            <td style="border: 1px solid #dee2e6; padding: 8px;">${part.part_number}</td>
                            <td style="border: 1px solid #dee2e6; padding: 8px;">${part.description || 'N/A'}</td>
                            <td style="border: 1px solid #dee2e6; padding: 8px; text-align: right;">${part.quantity}</td>
                        </tr>
                    `;
                });
                
                html += `
                        </tbody>
                    </table>
                `;
            }
            
            html += `
                    <p>We can check with our suppliers for availability or suggest alternative solutions. Please let us know how you would like to proceed.</p>
                    
                    <p>Best regards,<br>
                    ${companyName || 'Inventory Management Team'}</p>
                </div>
            `;
            
            return html;
        }
    },
    
    mixedResults: {
        subject: (partNumbers) => `Parts Availability - Mixed Results`,
        body: (data) => {
            const { foundParts, notFoundParts, senderName, companyName } = data;
            
            let html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Parts Availability Report</h2>
                    <p>Dear ${senderName || 'Customer'},</p>
                    <p>Thank you for your inquiry. Here's the availability status for your requested parts:</p>
                    
                    <h3 style="color: #28a745; margin-top: 20px;">✓ Available Parts:</h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                        <thead>
                            <tr style="background-color: #d4edda;">
                                <th style="border: 1px solid #c3e6cb; padding: 8px; text-align: left;">Part Number</th>
                                <th style="border: 1px solid #c3e6cb; padding: 8px; text-align: left;">Description</th>
                                <th style="border: 1px solid #c3e6cb; padding: 8px; text-align: left;">Location</th>
                                <th style="border: 1px solid #c3e6cb; padding: 8px; text-align: right;">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            foundParts.forEach(part => {
                html += `
                    <tr>
                        <td style="border: 1px solid #c3e6cb; padding: 8px;">${part.part_number}</td>
                        <td style="border: 1px solid #c3e6cb; padding: 8px;">${part.description || 'N/A'}</td>
                        <td style="border: 1px solid #c3e6cb; padding: 8px;">${part.location || 'N/A'}</td>
                        <td style="border: 1px solid #c3e6cb; padding: 8px; text-align: right;">${part.quantity}</td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                    
                    <h3 style="color: #dc3545; margin-top: 20px;">✗ Not Available:</h3>
                    <ul style="list-style-type: none; padding: 0;">
            `;
            
            notFoundParts.forEach(part => {
                html += `<li style="padding: 5px 0; color: #dc3545;">• ${part}</li>`;
            });
            
            html += `
                    </ul>
                    
                    <p>For the unavailable parts, we can check with our suppliers or suggest alternatives. Please let us know how you would like to proceed.</p>
                    
                    <p>Best regards,<br>
                    ${companyName || 'Inventory Management Team'}</p>
                </div>
            `;
            
            return html;
        }
    },
    
    customTemplate: {
        subject: (subject) => subject,
        body: (data) => {
            const { content, senderName, companyName } = data;
            
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <p>Dear ${senderName || 'Customer'},</p>
                    ${content}
                    <p>Best regards,<br>
                    ${companyName || 'Inventory Management Team'}</p>
                </div>
            `;
        }
    }
};

// Helper function to generate email signature
function generateSignature(userData) {
    return `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="margin: 0; font-weight: bold;">${userData.name || 'Inventory Team'}</p>
            <p style="margin: 0; color: #666;">${userData.email}</p>
            ${userData.phone ? `<p style="margin: 0; color: #666;">${userData.phone}</p>` : ''}
            ${userData.company ? `<p style="margin: 0; color: #666;">${userData.company}</p>` : ''}
        </div>
    `;
}

// Helper function to format currency
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Helper function to format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

module.exports = {
    emailTemplates,
    generateSignature,
    formatCurrency,
    formatDate
};