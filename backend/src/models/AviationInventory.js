const { pool } = require('../config/mysql');

class AviationInventory {
  // Get inventory with part details using the view
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        ii.item_id,
        ii.part_id,
        ii.serial_number,
        ii.condition_code,
        ii.bin_location,
        ii.tag_date,
        ii.expiry_date,
        ii.owner_id,
        ii.is_consignment,
        ii.overhaul_shop,
        ii.notes,
        ap.part_number,
        ap.description,
        ap.manufacturer,
        ap.aircraft_model,
        ap.category,
        ap.unit_price,
        cv.business_name as owner_name,
        CASE 
          WHEN ii.expiry_date < CURDATE() THEN 'Expired'
          WHEN ii.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expiring Soon'
          ELSE 'Valid'
        END as expiry_status
      FROM inventory_items ii
      JOIN aircraft_parts ap ON ii.part_id = ap.part_id
      LEFT JOIN customers_vendors cv ON ii.owner_id = cv.cv_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.search) {
      query += ' AND (ap.part_number LIKE ? OR ap.description LIKE ? OR ii.serial_number LIKE ?)';
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (filters.condition_code) {
      query += ' AND ii.condition_code = ?';
      params.push(filters.condition_code);
    }

    if (filters.location) {
      query += ' AND ii.bin_location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.owner_id) {
      query += ' AND ii.owner_id = ?';
      params.push(filters.owner_id);
    }

    if (filters.is_consignment !== undefined) {
      query += ' AND ii.is_consignment = ?';
      params.push(filters.is_consignment);
    }

    query += ' ORDER BY ap.part_number, ii.serial_number';

    try {
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get summary inventory levels
  static async getSummary() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          i.part_id,
          ap.part_number,
          ap.description,
          i.total_quantity,
          i.quantity_available,
          i.quantity_reserved,
          i.reorder_point,
          i.reorder_quantity,
          CASE 
            WHEN i.quantity_available <= i.reorder_point THEN 'Reorder'
            WHEN i.quantity_available <= i.reorder_point * 1.5 THEN 'Low'
            ELSE 'OK'
          END as stock_status
        FROM inventory i
        JOIN aircraft_parts ap ON i.part_id = ap.part_id
        ORDER BY ap.part_number
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          ii.*,
          ap.part_number,
          ap.description,
          ap.manufacturer,
          cv.business_name as owner_name
        FROM inventory_items ii
        JOIN aircraft_parts ap ON ii.part_id = ap.part_id
        LEFT JOIN customers_vendors cv ON ii.owner_id = cv.cv_id
        WHERE ii.item_id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(itemData) {
    const {
      part_id,
      serial_number,
      condition_code,
      bin_location,
      tag_date,
      expiry_date,
      owner_id,
      is_consignment,
      overhaul_shop,
      notes
    } = itemData;

    try {
      const [result] = await pool.execute(
        `INSERT INTO inventory_items 
        (part_id, serial_number, condition_code, bin_location, tag_date,
         expiry_date, owner_id, is_consignment, overhaul_shop, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          part_id, serial_number, condition_code, bin_location, tag_date,
          expiry_date, owner_id, is_consignment, overhaul_shop, notes
        ]
      );
      return { id: result.insertId, ...itemData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, itemData) {
    const fields = [];
    const values = [];

    Object.entries(itemData).forEach(([key, value]) => {
      if (key !== 'item_id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    values.push(id);

    try {
      const [result] = await pool.execute(
        `UPDATE inventory_items SET ${fields.join(', ')} WHERE item_id = ?`,
        values
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM inventory_items WHERE item_id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get movement history for an item
  static async getMovementHistory(itemId) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          sm.*,
          cv.business_name as entity_name
        FROM stock_movements sm
        LEFT JOIN customers_vendors cv ON sm.from_entity_id = cv.cv_id OR sm.to_entity_id = cv.cv_id
        WHERE sm.item_id = ?
        ORDER BY sm.movement_date DESC`,
        [itemId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AviationInventory;