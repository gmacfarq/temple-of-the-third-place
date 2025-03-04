const pool = require('../config/database');

const recordTransfer = async (req, res) => {
  try {
    const { sacramentId, quantity, type, notes } = req.body;
    const userId = req.user.id;

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
      // Update quantities based on transfer type
      let newStorage = sacrament[0].num_storage;
      let newActive = sacrament[0].num_active;
      let transferType = type;

      // Map frontend types to database types
      if (type === 'to_active') {
        // Check if there's enough in storage
        if (sacrament[0].num_storage < quantity) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ message: 'Not enough inventory in storage' });
        }
        newStorage -= quantity;
        newActive += quantity;
        transferType = 'out'; // Map to database enum
      } else if (type === 'to_storage') {
        // Check if there's enough in active
        if (sacrament[0].num_active < quantity) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ message: 'Not enough inventory in active' });
        }
        newStorage += quantity;
        newActive -= quantity;
        transferType = 'in'; // Map to database enum
      } else if (type === 'add_storage') {
        newStorage += quantity;
        transferType = 'in'; // Map to database enum
      } else {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: 'Invalid transfer type' });
      }

      // Record the transfer
      await connection.query(
        'INSERT INTO inventory_transfers (sacrament_id, quantity, type, notes, recorded_by) VALUES (?, ?, ?, ?, ?)',
        [sacramentId, quantity, transferType, notes || null, userId]
      );

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
    res.status(500).json({
      message: 'Error recording transfer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    const { sacramentId, actualStorage, actualActive, notes } = req.body;
    const userId = req.user.id;

    if (!sacramentId || actualStorage === undefined || actualActive === undefined) {
      return res.status(400).json({ message: 'Sacrament ID, actual storage, and actual active are required' });
    }

    const connection = await pool.getConnection();

    // Verify sacrament exists
    const [sacrament] = await connection.query(
      'SELECT id FROM sacraments WHERE id = ?',
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
        'INSERT INTO inventory_audits (sacrament_id, actual_storage, actual_active, notes, audited_by) VALUES (?, ?, ?, ?, ?)',
        [sacramentId, actualStorage, actualActive, notes || null, userId]
      );

      // Update sacrament quantities
      await connection.query(
        'UPDATE sacraments SET num_storage = ?, num_active = ? WHERE id = ?',
        [actualStorage, actualActive, sacramentId]
      );

      await connection.commit();
      connection.release();
      res.status(201).json({ message: 'Audit recorded successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error in recordAudit:', error);
    res.status(500).json({
      message: 'Error recording audit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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