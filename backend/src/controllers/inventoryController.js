const pool = require('../config/database');

const recordTransfer = async (req, res) => {
  try {
    const { sacramentId, quantity, type, notes } = req.body;
    const connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Record the transfer
      const [result] = await connection.query(
        'INSERT INTO inventory_transfers (sacrament_id, quantity, type, notes, recorded_by) VALUES (?, ?, ?, ?, ?)',
        [sacramentId, quantity, type, notes, req.user.userId]
      );

      // Update sacrament quantities based on transfer type
      if (type === 'in') {
        await connection.query(
          'UPDATE sacraments SET num_storage = num_storage + ? WHERE id = ?',
          [quantity, sacramentId]
        );
      } else if (type === 'out') {
        await connection.query(
          'UPDATE sacraments SET num_active = num_active + ?, num_storage = num_storage - ? WHERE id = ?',
          [quantity, quantity, sacramentId]
        );
      }

      await connection.commit();
      connection.release();

      res.status(201).json({
        message: 'Transfer recorded successfully',
        transferId: result.insertId
      });
    } catch (error) {
      await connection.rollback();
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
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'INSERT INTO inventory_audits (sacrament_id, actual_quantity, notes, audited_by) VALUES (?, ?, ?, ?)',
      [sacramentId, actualQuantity, notes, req.user.userId]
    );

    // Update the sacrament's storage quantity to match audit
    await connection.query(
      'UPDATE sacraments SET num_storage = ? WHERE id = ?',
      [actualQuantity, sacramentId]
    );

    connection.release();
    res.status(201).json({
      message: 'Audit recorded successfully',
      auditId: result.insertId
    });
  } catch (error) {
    console.error('Error in recordAudit:', error);
    res.status(500).json({ message: 'Error recording audit' });
  }
};

module.exports = {
  recordTransfer,
  getInventoryHistory,
  getInventoryAlerts,
  recordAudit
};