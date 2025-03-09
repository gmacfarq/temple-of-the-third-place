const pool = require('../config/database');

const getAllSacraments = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [sacraments] = await connection.query(`
      SELECT
        s.id,
        s.name,
        s.type,
        s.strain,
        s.description,
        s.num_storage,
        s.num_active,
        s.suggested_donation,
        s.low_inventory_threshold,
        (s.num_storage + s.num_active) as total_inventory
      FROM sacraments s
      ORDER BY s.name
    `);
    connection.release();
    res.json(sacraments);
  } catch (error) {
    console.error('Error in getAllSacraments:', error);
    res.status(500).json({ message: 'Error fetching sacraments' });
  }
};

const getSacramentById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    const [sacrament] = await connection.query(
      `SELECT id, name, type, strain, description, num_storage, num_active,
      suggested_donation, low_inventory_threshold
      FROM sacraments WHERE id = ?`,
      [id]
    );

    connection.release();

    if (sacrament.length === 0) {
      return res.status(404).json({ message: 'Sacrament not found' });
    }

    console.log('Sacrament data from DB:', sacrament[0]); // Debug log
    res.json(sacrament[0]);
  } catch (error) {
    console.error('Error in getSacramentById:', error);
    res.status(500).json({ message: 'Error fetching sacrament' });
  }
};

const createSacrament = async (req, res) => {
  try {
    const {
      name,
      type,
      strain,
      description,
      numStorage,
      suggestedDonation,
      lowInventoryThreshold = 5 // Default to 5 if not provided
    } = req.body;

    // Validate input
    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO sacraments (
        name,
        type,
        strain,
        description,
        num_storage,
        num_active,
        suggested_donation,
        low_inventory_threshold
      ) VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        name,
        type,
        strain || null,
        description || null,
        numStorage || 0,
        suggestedDonation || 0,
        lowInventoryThreshold
      ]
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      name,
      type,
      strain,
      description,
      numStorage,
      numActive: 0,
      suggestedDonation,
      lowInventoryThreshold
    });
  } catch (error) {
    console.error('Error in createSacrament:', error);
    res.status(500).json({ message: 'Error creating sacrament' });
  }
};

const updateSacrament = async (req, res) => {
  try {
    const {
      name,
      type,
      strain,
      description,
      numStorage,
      numActive,
      suggestedDonation,
      lowInventoryThreshold
    } = req.body;

    const connection = await pool.getConnection();

    // Build the update query dynamically based on provided fields
    let updateFields = [];
    let queryParams = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      queryParams.push(name);
    }

    if (type !== undefined) {
      updateFields.push('type = ?');
      queryParams.push(type);
    }

    if (strain !== undefined) {
      updateFields.push('strain = ?');
      queryParams.push(strain);
    }

    if (description !== undefined) {
      updateFields.push('description = ?');
      queryParams.push(description);
    }

    if (numStorage !== undefined) {
      updateFields.push('num_storage = ?');
      queryParams.push(numStorage);
    }

    if (numActive !== undefined) {
      updateFields.push('num_active = ?');
      queryParams.push(numActive);
    }

    if (suggestedDonation !== undefined) {
      updateFields.push('suggested_donation = ?');
      queryParams.push(suggestedDonation);
    }

    if (lowInventoryThreshold !== undefined) {
      updateFields.push('low_inventory_threshold = ?');
      queryParams.push(lowInventoryThreshold);
    }

    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Add the ID parameter
    queryParams.push(req.params.id);

    const [result] = await connection.query(
      `UPDATE sacraments SET ${updateFields.join(', ')} WHERE id = ?`,
      queryParams
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sacrament not found' });
    }

    res.json({ message: 'Sacrament updated successfully' });
  } catch (error) {
    console.error('Error in updateSacrament:', error);
    res.status(500).json({ message: 'Error updating sacrament' });
  }
};

const deleteSacrament = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [existingRecord] = await connection.query(
      'SELECT id FROM sacraments WHERE id = ?',
      [req.params.id]
    );

    if (existingRecord.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Sacrament not found' });
    }

    await connection.query(
      'DELETE FROM sacraments WHERE id = ?',
      [req.params.id]
    );
    connection.release();

    res.json({ message: 'Sacrament deleted successfully' });
  } catch (error) {
    console.error('Error in deleteSacrament:', error);
    res.status(500).json({ message: 'Error deleting sacrament' });
  }
};

const getLowInventory = async (req, res) => {
  try {
    const threshold = req.query.threshold || 10; // Default threshold of 10
    const connection = await pool.getConnection();

    const [lowInventory] = await connection.query(
      'SELECT * FROM sacraments WHERE num_storage <= ? ORDER BY num_storage ASC',
      [threshold]
    );
    connection.release();

    res.json(lowInventory);
  } catch (error) {
    console.error('Error in getLowInventory:', error);
    res.status(500).json({ message: 'Error fetching low inventory sacraments' });
  }
};

const updateBatch = async (req, res) => {
  try {
    const { batchId, numStorage } = req.body;
    const connection = await pool.getConnection();

    const [existingRecord] = await connection.query(
      'SELECT id FROM sacraments WHERE id = ?',
      [req.params.id]
    );

    if (existingRecord.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Sacrament not found' });
    }

    await connection.query(
      'UPDATE sacraments SET batch_id = ?, num_storage = ? WHERE id = ?',
      [batchId, numStorage, req.params.id]
    );
    connection.release();

    res.json({ message: 'Batch information updated successfully' });
  } catch (error) {
    console.error('Error in updateBatch:', error);
    res.status(500).json({ message: 'Error updating batch information' });
  }
};

module.exports = {
  getAllSacraments,
  getSacramentById,
  createSacrament,
  updateSacrament,
  deleteSacrament,
  getLowInventory,
  updateBatch
};