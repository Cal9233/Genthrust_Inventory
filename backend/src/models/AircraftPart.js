const { pool } = require('../config/mysql');

class AircraftPart {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM aircraft_parts WHERE 1=1';
    const params = [];

    if (filters.search) {
      query += ' AND (part_number LIKE ? OR description LIKE ? OR manufacturer LIKE ?)';
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.aircraft_model) {
      query += ' AND aircraft_model LIKE ?';
      params.push(`%${filters.aircraft_model}%`);
    }

    query += ' ORDER BY part_number';

    try {
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM aircraft_parts WHERE part_id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByPartNumber(partNumber) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM aircraft_parts WHERE part_number = ?',
        [partNumber]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(partData) {
    const {
      part_number,
      description,
      manufacturer,
      aircraft_model,
      part_type,
      category,
      unit_of_measure,
      unit_price,
      currency,
      is_rotable,
      shelf_life_months,
      hazmat_flag,
      notes
    } = partData;

    try {
      const [result] = await pool.execute(
        `INSERT INTO aircraft_parts 
        (part_number, description, manufacturer, aircraft_model, part_type, 
         category, unit_of_measure, unit_price, currency, is_rotable, 
         shelf_life_months, hazmat_flag, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          part_number, description, manufacturer, aircraft_model, part_type,
          category, unit_of_measure, unit_price, currency, is_rotable,
          shelf_life_months, hazmat_flag, notes
        ]
      );
      return { id: result.insertId, ...partData };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, partData) {
    const fields = [];
    const values = [];

    Object.entries(partData).forEach(([key, value]) => {
      if (key !== 'part_id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    values.push(id);

    try {
      const [result] = await pool.execute(
        `UPDATE aircraft_parts SET ${fields.join(', ')} WHERE part_id = ?`,
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
        'DELETE FROM aircraft_parts WHERE part_id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AircraftPart;