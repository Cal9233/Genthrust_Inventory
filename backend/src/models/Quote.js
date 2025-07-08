const db = require('../config/database');

class Quote {
    static async create(quoteData) {
        const {
            user_id,
            email_id,
            sender_email,
            sender_name,
            subject,
            body,
            part_numbers,
            received_at
        } = quoteData;

        const query = `
            INSERT INTO quotes (
                user_id, email_id, sender_email, sender_name, 
                subject, body, part_numbers, received_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            user_id,
            email_id,
            sender_email,
            sender_name,
            subject,
            body,
            part_numbers,
            received_at
        ];
        
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM quotes WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async findByEmailId(email_id) {
        const query = 'SELECT * FROM quotes WHERE email_id = $1';
        const { rows } = await db.query(query, [email_id]);
        return rows[0];
    }

    static async findByUserId(user_id, options = {}) {
        const { status, limit = 50, offset = 0 } = options;
        let query = 'SELECT * FROM quotes WHERE user_id = $1';
        const values = [user_id];

        if (status) {
            query += ' AND status = $2';
            values.push(status);
        }

        query += ' ORDER BY received_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
        values.push(limit, offset);

        const { rows } = await db.query(query, values);
        return rows;
    }

    static async updateStatus(id, status) {
        const query = `
            UPDATE quotes 
            SET status = $2, processed_at = CASE WHEN $2 IN ('processed', 'responded') THEN CURRENT_TIMESTAMP ELSE NULL END
            WHERE id = $1
            RETURNING *
        `;
        const { rows } = await db.query(query, [id, status]);
        return rows[0];
    }

    static async getStats(user_id) {
        const query = `
            SELECT 
                COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
                COUNT(*) FILTER (WHERE status = 'processed') as processed_count,
                COUNT(*) FILTER (WHERE status = 'responded') as responded_count,
                COUNT(*) as total_count
            FROM quotes
            WHERE user_id = $1
        `;
        const { rows } = await db.query(query, [user_id]);
        return rows[0];
    }

    static async searchByPartNumber(user_id, part_number) {
        const query = `
            SELECT * FROM quotes 
            WHERE user_id = $1 AND $2 = ANY(part_numbers)
            ORDER BY received_at DESC
        `;
        const { rows } = await db.query(query, [user_id, part_number]);
        return rows;
    }
}

module.exports = Quote;