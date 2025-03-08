const pool = require('../config/database');

const recordTransfer = async (req, res) => {
  try {
    const { sacramentId, quantity, type, notes } = req.body;
    const connection = await pool.getConnection();

    // Get current inventory levels
    const [sacrament] = await connection.query(
      'SELECT num_storage, num_active FROM sacraments WHERE id = ?',
      [sacramentId]
    );

    if (sacrament.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Sacrament not found' });
    }

    const currentSacrament = sacrament[0];
    let newStorageAmount = currentSacrament.num_storage;
    let newActiveAmount = currentSacrament.num_active;

    // Update inventory based on transfer type
    switch (type) {
      case 'to_active':
        if (quantity > currentSacrament.num_storage) {
          connection.release();
          return res.status(400).json({ message: 'Not enough inventory in storage' });
        }
        newStorageAmount = currentSacrament.num_storage - quantity;
        newActiveAmount = currentSacrament.num_active + quantity;
        break;
      case 'to_storage':
        if (quantity > currentSacrament.num_active) {
          connection.release();
          return res.status(400).json({ message: 'Not enough inventory in active' });
        }
        newStorageAmount = currentSacrament.num_storage + quantity;
        newActiveAmount = currentSacrament.num_active - quantity;
        break;
      case 'add_storage':
        newStorageAmount = currentSacrament.num_storage + quantity;
        break;
      case 'remove_storage':
        // Remove from storage first, then from active if needed
        let remainingToRemove = quantity;

        if (remainingToRemove <= currentSacrament.num_storage) {
          // We can remove it all from storage
          newStorageAmount = currentSacrament.num_storage - remainingToRemove;
          remainingToRemove = 0;
        } else {
          // Remove all from storage and the rest from active
          remainingToRemove -= currentSacrament.num_storage;
          newStorageAmount = 0;
          newActiveAmount = currentSacrament.num_active - remainingToRemove;
        }

        // Check if we have enough total inventory
        if (quantity > (currentSacrament.num_storage + currentSacrament.num_active)) {
          connection.release();
          return res.status(400).json({ message: 'Not enough total inventory to remove' });
        }
        break;
      default:
        connection.release();
        return res.status(400).json({ message: 'Invalid transfer type' });
    }

    // Update the sacrament inventory
    await connection.query(
      'UPDATE sacraments SET num_storage = ?, num_active = ? WHERE id = ?',
      [newStorageAmount, newActiveAmount, sacramentId]
    );

    // Record the inventory transfer
    await connection.query(
      `INSERT INTO inventory_transfers
      (sacrament_id, quantity, type, recorded_by, notes)
      VALUES (?, ?, ?, ?, ?)`,
      [
        sacramentId,
        quantity,
        type,
        req.user.userId,
        notes || null
      ]
    );

    connection.release();
    res.json({ message: 'Inventory transfer recorded successfully' });
  } catch (error) {
    console.error('Error in recordTransfer:', error);
    res.status(500).json({ message: 'Error recording inventory transfer' });
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

const removeInventory = async (req, res) => {
  try {
    const { sacramentId, quantity } = req.body;

    if (!sacramentId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    const connection = await pool.getConnection();

    // Get current inventory levels
    const [sacrament] = await connection.query(
      'SELECT num_storage, num_active FROM sacraments WHERE id = ?',
      [sacramentId]
    );

    if (sacrament.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Sacrament not found' });
    }

    const currentSacrament = sacrament[0];
    const totalInventory = currentSacrament.num_storage + currentSacrament.num_active;

    if (quantity > totalInventory) {
      connection.release();
      return res.status(400).json({ message: 'Not enough inventory to remove' });
    }

    // Remove from storage first, then from active if needed
    let remainingToRemove = quantity;
    let newStorageAmount = currentSacrament.num_storage;
    let newActiveAmount = currentSacrament.num_active;

    if (remainingToRemove <= currentSacrament.num_storage) {
      // We can remove it all from storage
      newStorageAmount = currentSacrament.num_storage - remainingToRemove;
      remainingToRemove = 0;
    } else {
      // Remove all from storage and the rest from active
      remainingToRemove -= currentSacrament.num_storage;
      newStorageAmount = 0;
      newActiveAmount = currentSacrament.num_active - remainingToRemove;
    }

    // Update the sacrament inventory
    await connection.query(
      'UPDATE sacraments SET num_storage = ?, num_active = ? WHERE id = ?',
      [newStorageAmount, newActiveAmount, sacramentId]
    );

    // Record the inventory removal
    await connection.query(
      `INSERT INTO inventory_transfers
      (sacrament_id, quantity, type, recorded_by, notes)
      VALUES (?, ?, ?, ?, ?)`,
      [
        sacramentId,
        quantity,
        'remove_storage',
        req.user.userId,
        'Inventory removal'
      ]
    );

    connection.release();
    res.json({ message: 'Inventory removed successfully' });
  } catch (error) {
    console.error('Error in removeInventory:', error);
    res.status(500).json({ message: 'Error removing inventory' });
  }
};

module.exports = {
  recordTransfer,
  getInventoryHistory,
  getInventoryAlerts,
  recordAudit,
  getInventoryAudits,
  removeInventory
};