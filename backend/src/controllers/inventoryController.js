const pool = require('../config/database');

const recordTransfer = async (req, res) => {
  try {
    const { sacramentId, quantity, type, notes } = req.body;

    if (!sacramentId || !quantity || !type) {
      return res.status(400).json({ message: 'Sacrament ID, quantity, and type are required' });
    }

    const connection = await pool.getConnection();

    // Verify sacrament exists and get current quantities
    const [sacrament] = await connection.query(
      'SELECT id, num_storage, num_active FROM sacraments WHERE id = ?',
      [sacramentId]
    );

    if (sacrament.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Sacrament not found' });
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      // Record the transfer
      await connection.query(
        'INSERT INTO inventory_transfers (sacrament_id, quantity, type, notes) VALUES (?, ?, ?, ?)',
        [sacramentId, quantity, type, notes]
      );

      // Update quantities based on transfer type
      let newStorage = sacrament[0].num_storage;
      let newActive = sacrament[0].num_active;

      if (type === 'in') {
        newStorage += quantity;
      } else if (type === 'out') {
        if (newStorage < quantity) {
          throw new Error('Insufficient inventory');
        }
        newStorage -= quantity;
        newActive += quantity;
      }

      // Update sacrament quantities
      await connection.query(
        'UPDATE sacraments SET num_storage = ?, num_active = ? WHERE id = ?',
        [newStorage, newActive, sacramentId]
      );

      await connection.commit();
      connection.release();

      res.status(201).json({ message: 'Transfer recorded successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error in recordTransfer:', error);
    res.status(500).json({ message: 'Error recording transfer' });
  }
};

const getInventoryHistory = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [history] = await connection.query(`
      SELECT
        it.*,
        s.name as sacrament_name,
        CONCAT(u.first_name, ' ', u.last_name) as recorded_by_name
      FROM inventory_transfers it
      LEFT JOIN sacraments s ON it.sacrament_id = s.id
      LEFT JOIN users u ON it.recorded_by = u.id
      ORDER BY it.created_at DESC
    `);
    connection.release();
    res.json(history);
  } catch (error) {
    console.error('Error in getInventoryHistory:', error);
    res.status(500).json({ message: 'Error fetching inventory history' });
  }
};

const getInventoryAlerts = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [alerts] = await connection.query(`
      SELECT
        id,
        name,
        type,
        num_storage,
        num_active
      FROM sacraments
      WHERE num_storage <= 10
      OR (num_storage / (num_active + 1)) < 0.2
      ORDER BY num_storage ASC
    `);
    connection.release();
    res.json(alerts);
  } catch (error) {
    console.error('Error in getInventoryAlerts:', error);
    res.status(500).json({ message: 'Error fetching inventory alerts' });
  }
};

const recordAudit = async (req, res) => {
  try {
    const { sacramentId, actualQuantity, notes } = req.body;
    console.log('Audit request:', { sacramentId, actualQuantity, notes });

    if (!sacramentId || actualQuantity === undefined) {
      return res.status(400).json({ message: 'Sacrament ID and actual quantity are required' });
    }

    const connection = await pool.getConnection();

    // Verify sacrament exists
    const [sacrament] = await connection.query(
      'SELECT id, num_storage FROM sacraments WHERE id = ?',
      [sacramentId]
    );

    if (sacrament.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Sacrament not found' });
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      // Record the audit
      await connection.query(
        'INSERT INTO inventory_audits (sacrament_id, actual_quantity, notes, audited_by) VALUES (?, ?, ?, ?)',
        [sacramentId, actualQuantity, notes, req.user.id]
      );

      // Update the sacrament's storage quantity
      await connection.query(
        'UPDATE sacraments SET num_storage = ? WHERE id = ?',
        [actualQuantity, sacramentId]
      );

      await connection.commit();
      connection.release();

      res.status(201).json({ message: 'Audit recorded successfully' });
    } catch (error) {
      console.error('Transaction error:', error);
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error in recordAudit:', error);
    res.status(500).json({
      message: 'Error recording audit',
      error: process.env.NODE_ENV === 'test' ? error.message : undefined
    });
  }
};

const getInventoryAudits = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [audits] = await connection.query(`
      SELECT
        ia.*,
        s.name as sacrament_name,
        CONCAT(u.first_name, ' ', u.last_name) as audited_by_name
      FROM inventory_audits ia
      LEFT JOIN sacraments s ON ia.sacrament_id = s.id
      LEFT JOIN users u ON ia.audited_by = u.id
      ORDER BY ia.created_at DESC
    `);
    connection.release();
    res.json(audits);
  } catch (error) {
    console.error('Error in getInventoryAudits:', error);
    res.status(500).json({ message: 'Error fetching inventory audits' });
  }
};

module.exports = {
  recordTransfer,
  getInventoryHistory,
  getInventoryAlerts,
  recordAudit,
  getInventoryAudits
};