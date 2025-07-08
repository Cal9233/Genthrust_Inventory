const db = require('../config/database');

class QuoteResponse {
    static async create(responseData) {
        const {
            quote_id,
            user_id,
            response_body,
            template_used,
            parts_found,
            parts_not_found
        } = responseData;

        const query = `
            INSERT INTO quote_responses (
                quote_id, user_id, response_body, template_used, 
                parts_found, parts_not_found
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            quote_id,
            user_id,
            response_body,
            template_used,
            parts_found || [],
            parts_not_found || []
        ];
        
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findByQuoteId(quote_id) {
        const query = `
            SELECT qr.*, u.email as user_email, u.name as user_name
            FROM quote_responses qr
            JOIN users u ON qr.user_id = u.id
            WHERE qr.quote_id = $1
            ORDER BY qr.response_sent_at DESC
        `;
        const { rows } = await db.query(query, [quote_id]);
        return rows;
    }

    static async findByUserId(user_id, options = {}) {
        const { limit = 50, offset = 0 } = options;
        const query = `
            SELECT qr.*, q.subject, q.sender_email
            FROM quote_responses qr
            JOIN quotes q ON qr.quote_id = q.id
            WHERE qr.user_id = $1
            ORDER BY qr.response_sent_at DESC
            LIMIT $2 OFFSET $3
        `;
        const { rows } = await db.query(query, [user_id, limit, offset]);
        return rows;
    }

    static async getStats(user_id) {
        const query = `
            SELECT 
                COUNT(*) as total_responses,
                COUNT(DISTINCT quote_id) as unique_quotes_responded,
                array_length(array_agg(DISTINCT unnest(parts_found)), 1) as total_parts_found,
                array_length(array_agg(DISTINCT unnest(parts_not_found)), 1) as total_parts_not_found
            FROM quote_responses
            WHERE user_id = $1
        `;
        const { rows } = await db.query(query, [user_id]);
        return rows[0];
    }
}

module.exports = QuoteResponse;