const db = require('../config/database');

class User {
    static async create(userData) {
        const { microsoft_id, email, name, access_token, refresh_token, token_expires_at } = userData;
        const query = `
            INSERT INTO users (microsoft_id, email, name, access_token, refresh_token, token_expires_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [microsoft_id, email, name, access_token, refresh_token, token_expires_at];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async findByMicrosoftId(microsoft_id) {
        const query = 'SELECT * FROM users WHERE microsoft_id = $1';
        const { rows } = await db.query(query, [microsoft_id]);
        return rows[0];
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(query, [email]);
        return rows[0];
    }

    static async updateTokens(id, tokens) {
        const { access_token, refresh_token, token_expires_at } = tokens;
        const query = `
            UPDATE users 
            SET access_token = $2, refresh_token = $3, token_expires_at = $4
            WHERE id = $1
            RETURNING *
        `;
        const values = [id, access_token, refresh_token, token_expires_at];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async update(id, userData) {
        const fields = [];
        const values = [];
        let paramCounter = 1;

        Object.entries(userData).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCounter}`);
                values.push(value);
                paramCounter++;
            }
        });

        values.push(id);
        const query = `
            UPDATE users 
            SET ${fields.join(', ')}
            WHERE id = $${paramCounter}
            RETURNING *
        `;
        
        const { rows } = await db.query(query, values);
        return rows[0];
    }
}

module.exports = User;