const db = require('../config/database');

class InventoryItem {
    static async create(itemData) {
        const {
            user_id,
            part_number,
            description,
            location,
            quantity,
            source_sheet,
            excel_file_id
        } = itemData;

        const query = `
            INSERT INTO inventory_items (
                user_id, part_number, description, location, 
                quantity, source_sheet, excel_file_id, last_synced
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, part_number, source_sheet) 
            DO UPDATE SET
                description = EXCLUDED.description,
                location = EXCLUDED.location,
                quantity = EXCLUDED.quantity,
                excel_file_id = EXCLUDED.excel_file_id,
                last_synced = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const values = [
            user_id,
            part_number,
            description,
            location,
            quantity,
            source_sheet,
            excel_file_id
        ];
        
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findByPartNumber(user_id, part_number) {
        const query = `
            SELECT * FROM inventory_items 
            WHERE user_id = $1 AND part_number = $2
            ORDER BY source_sheet ASC
        `;
        const { rows } = await db.query(query, [user_id, part_number]);
        return rows;
    }

    static async searchPartNumbers(user_id, partNumbers) {
        const query = `
            SELECT * FROM inventory_items 
            WHERE user_id = $1 AND part_number = ANY($2::text[])
            ORDER BY part_number, source_sheet
        `;
        const { rows } = await db.query(query, [user_id, partNumbers]);
        return rows;
    }

    static async findByUserId(user_id, options = {}) {
        const { source_sheet, limit = 100, offset = 0 } = options;
        let query = 'SELECT * FROM inventory_items WHERE user_id = $1';
        const values = [user_id];

        if (source_sheet) {
            query += ' AND source_sheet = $2';
            values.push(source_sheet);
        }

        query += ' ORDER BY part_number ASC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
        values.push(limit, offset);

        const { rows } = await db.query(query, values);
        return rows;
    }

    static async bulkCreate(user_id, items, source_sheet, excel_file_id) {
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');

            // Delete existing items for this source to ensure clean sync
            await client.query(
                'DELETE FROM inventory_items WHERE user_id = $1 AND source_sheet = $2',
                [user_id, source_sheet]
            );

            // Insert new items
            for (const item of items) {
                await client.query(`
                    INSERT INTO inventory_items (
                        user_id, part_number, description, location, 
                        quantity, source_sheet, excel_file_id, last_synced
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
                `, [
                    user_id,
                    item.part_number,
                    item.description,
                    item.location,
                    item.quantity,
                    source_sheet,
                    excel_file_id
                ]);
            }

            await client.query('COMMIT');
            return { success: true, count: items.length };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async search(user_id, searchTerm) {
        const query = `
            SELECT * FROM inventory_items 
            WHERE user_id = $1 AND (
                part_number ILIKE $2 OR 
                description ILIKE $2 OR 
                location ILIKE $2
            )
            ORDER BY part_number ASC
            LIMIT 50
        `;
        const { rows } = await db.query(query, [user_id, `%${searchTerm}%`]);
        return rows;
    }
}

module.exports = InventoryItem;