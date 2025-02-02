const pool = require('../config/database');

const getAllSacraments = async (req, res) => {
  try {
    console.log('Getting all sacraments...');
    const connection = await pool.getConnection();
    console.log('Database connection established');

    const [sacraments] = await connection.query(
      'SELECT id, name, type, description, num_storage, num_active, suggested_donation FROM sacraments'
    );
    console.log('Query executed, results:', sacraments);

    connection.release();
    res.json(sacraments);
  } catch (error) {
    console.error('Error in getAllSacraments:', error);
    res.status(500).json({
      message: 'Error fetching sacraments',
      error: error.message
    });
  }
};

const getSacramentById = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [sacrament] = await connection.query(
      'SELECT * FROM sacraments WHERE id = ?',
      [req.params.id]
    );
    connection.release();

    if (sacrament.length === 0) {
      return res.status(404).json({ message: 'Sacrament not found' });
    }

    res.json(sacrament[0]);
  } catch (error) {
    console.error('Error in getSacramentById:', error);
    res.status(500).json({ message: 'Error fetching sacrament' });
  }
};

const createSacrament = async (req, res) => {
  try {
    const { name, type, description, numStorage, suggestedDonation, batchId } = req.body;
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'INSERT INTO sacraments (name, type, description, num_storage, suggested_donation, batch_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, type, description, numStorage, suggestedDonation, batchId]
    );
    connection.release();

    res.status(201).json({
      message: 'Sacrament created successfully',
      sacramentId: result.insertId
    });
  } catch (error) {
    console.error('Error in createSacrament:', error);
    res.status(500).json({ message: 'Error creating sacrament' });
  }
};

const updateSacrament = async (req, res) => {
  try {
    const { name, type, description, numStorage, numActive, suggestedDonation } = req.body;
    const connection = await pool.getConnection();

    // Check if sacrament exists
    const [existingSacrament] = await connection.query(
      'SELECT id FROM sacraments WHERE id = ?',
      [req.params.id]
    );

    if (existingSacrament.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Sacrament not found' });
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (numStorage !== undefined) {
      updates.push('num_storage = ?');
      values.push(numStorage);
    }
    if (numActive !== undefined) {
      updates.push('num_active = ?');
      values.push(numActive);
    }
    if (suggestedDonation !== undefined) {
      updates.push('suggested_donation = ?');
      values.push(suggestedDonation);
    }

    // Add the ID to values array
    values.push(req.params.id);

    await connection.query(
      `UPDATE sacraments SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    connection.release();
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