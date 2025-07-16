const express = require('express');
const router = express.Router();
const AircraftPart = require('../models/AircraftPart');
const AviationInventory = require('../models/AviationInventory');
const { pool } = require('../config/mysql');

// Aircraft Parts Routes
router.get('/parts', async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      category: req.query.category,
      aircraft_model: req.query.aircraft_model
    };
    const parts = await AircraftPart.findAll(filters);
    res.json(parts);
  } catch (error) {
    console.error('Error fetching aircraft parts:', error);
    res.status(500).json({ error: 'Failed to fetch aircraft parts' });
  }
});

router.get('/parts/:id', async (req, res) => {
  try {
    const part = await AircraftPart.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ error: 'Part not found' });
    }
    res.json(part);
  } catch (error) {
    console.error('Error fetching part:', error);
    res.status(500).json({ error: 'Failed to fetch part' });
  }
});

router.post('/parts', async (req, res) => {
  try {
    const part = await AircraftPart.create(req.body);
    res.status(201).json(part);
  } catch (error) {
    console.error('Error creating part:', error);
    res.status(500).json({ error: 'Failed to create part' });
  }
});

router.put('/parts/:id', async (req, res) => {
  try {
    const success = await AircraftPart.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Part not found' });
    }
    res.json({ message: 'Part updated successfully' });
  } catch (error) {
    console.error('Error updating part:', error);
    res.status(500).json({ error: 'Failed to update part' });
  }
});

router.delete('/parts/:id', async (req, res) => {
  try {
    const success = await AircraftPart.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Part not found' });
    }
    res.json({ message: 'Part deleted successfully' });
  } catch (error) {
    console.error('Error deleting part:', error);
    res.status(500).json({ error: 'Failed to delete part' });
  }
});

// Inventory Routes
router.get('/inventory', async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      condition_code: req.query.condition_code,
      location: req.query.location,
      owner_id: req.query.owner_id,
      is_consignment: req.query.is_consignment
    };
    const inventory = await AviationInventory.findAll(filters);
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

router.get('/inventory/summary', async (req, res) => {
  try {
    const summary = await AviationInventory.getSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    res.status(500).json({ error: 'Failed to fetch inventory summary' });
  }
});

router.get('/inventory/:id', async (req, res) => {
  try {
    const item = await AviationInventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

router.get('/inventory/:id/history', async (req, res) => {
  try {
    const history = await AviationInventory.getMovementHistory(req.params.id);
    res.json(history);
  } catch (error) {
    console.error('Error fetching movement history:', error);
    res.status(500).json({ error: 'Failed to fetch movement history' });
  }
});

router.post('/inventory', async (req, res) => {
  try {
    const item = await AviationInventory.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

router.put('/inventory/:id', async (req, res) => {
  try {
    const success = await AviationInventory.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json({ message: 'Inventory item updated successfully' });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

router.delete('/inventory/:id', async (req, res) => {
  try {
    const success = await AviationInventory.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

// Purchase Orders Routes
router.get('/purchase-orders', async (req, res) => {
  try {
    const query = `
      SELECT 
        po.po_id,
        po.po_number,
        po.vendor_id,
        cv.business_name as vendor_name,
        po.order_date,
        po.expected_date,
        po.status,
        po.total_amount,
        po.currency,
        po.notes
      FROM purchase_orders po
      JOIN customers_vendors cv ON po.vendor_id = cv.cv_id
      ORDER BY po.order_date DESC
    `;
    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

router.get('/purchase-orders/:id', async (req, res) => {
  try {
    // Get PO header
    const [poRows] = await pool.execute(`
      SELECT 
        po.*,
        cv.business_name as vendor_name
      FROM purchase_orders po
      JOIN customers_vendors cv ON po.vendor_id = cv.cv_id
      WHERE po.po_id = ?
    `, [req.params.id]);

    if (poRows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // Get PO items
    const [itemRows] = await pool.execute(`
      SELECT 
        poi.*,
        ap.part_number,
        ap.description
      FROM purchase_order_items poi
      JOIN aircraft_parts ap ON poi.part_id = ap.part_id
      WHERE poi.po_id = ?
    `, [req.params.id]);

    res.json({
      ...poRows[0],
      items: itemRows
    });
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
});

// Customers/Vendors Routes
router.get('/entities', async (req, res) => {
  try {
    const query = `
      SELECT 
        cv_id,
        business_name,
        is_customer,
        is_vendor,
        contact_name,
        email,
        phone,
        address_line1,
        city,
        state,
        country,
        certification
      FROM customers_vendors
      ORDER BY business_name
    `;
    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({ error: 'Failed to fetch entities' });
  }
});

// Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const [partCount] = await pool.execute('SELECT COUNT(*) as count FROM aircraft_parts');
    const [inventoryCount] = await pool.execute('SELECT COUNT(*) as count FROM inventory_items');
    const [poCount] = await pool.execute("SELECT COUNT(*) as count FROM purchase_orders WHERE status = 'pending'");
    const [lowStock] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM inventory i 
      WHERE quantity_available <= reorder_point
    `);

    res.json({
      totalParts: partCount[0].count,
      totalInventoryItems: inventoryCount[0].count,
      pendingPurchaseOrders: poCount[0].count,
      lowStockItems: lowStock[0].count
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;