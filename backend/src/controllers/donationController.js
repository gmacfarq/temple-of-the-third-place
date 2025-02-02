const pool = require('../config/database');

const createDonation = async (req, res) => {
  try {
    const { memberId, sacramentId, amount, notes } = req.body;

    // Validation checks
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid donation amount' });
    }

    if (!memberId || !sacramentId) {
      return res.status(400).json({ message: 'Member ID and Sacrament ID are required' });
    }

    const connection = await pool.getConnection();

    // Verify member exists
    const [member] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [memberId]
    );

    if (member.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Invalid member ID' });
    }

    // Verify sacrament exists
    const [sacrament] = await connection.query(
      'SELECT id FROM sacraments WHERE id = ?',
      [sacramentId]
    );

    if (sacrament.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Invalid sacrament ID' });
    }

    // Create donation record and get the inserted ID
    const [result] = await connection.query(
      'INSERT INTO donations (member_id, sacrament_id, amount, notes) VALUES (?, ?, ?, ?)',
      [memberId, sacramentId, amount, notes]
    );

    connection.release();
    res.status(201).json({
      message: 'Donation recorded successfully',
      donationId: result.insertId
    });
  } catch (error) {
    console.error('Error in createDonation:', error);
    res.status(500).json({ message: 'Error recording donation' });
  }
};

const getDonations = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [donations] = await connection.query(`
      SELECT
        d.*,
        CONCAT(u.first_name, ' ', u.last_name) as member_name,
        s.name as sacrament_name
      FROM donations d
      LEFT JOIN users u ON d.member_id = u.id
      LEFT JOIN sacraments s ON d.sacrament_id = s.id
      ORDER BY d.created_at DESC
    `);
    connection.release();
    res.json(donations);
  } catch (error) {
    console.error('Error in getDonations:', error);
    res.status(500).json({ message: 'Error fetching donations' });
  }
};

const getMemberDonations = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [donations] = await connection.query(`
      SELECT
        d.*,
        s.name as sacrament_name
      FROM donations d
      LEFT JOIN sacraments s ON d.sacrament_id = s.id
      WHERE d.member_id = ?
      ORDER BY d.created_at DESC
    `, [req.params.memberId]);
    connection.release();
    res.json(donations);
  } catch (error) {
    console.error('Error in getMemberDonations:', error);
    res.status(500).json({ message: 'Error fetching member donations' });
  }
};

const getDonationStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [stats] = await connection.query(`
      SELECT
        COUNT(*) as total_donations,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        COUNT(DISTINCT member_id) as unique_donors,
        COUNT(DISTINCT sacrament_id) as sacraments_supported
      FROM donations
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    connection.release();
    res.json(stats[0]);
  } catch (error) {
    console.error('Error in getDonationStats:', error);
    res.status(500).json({ message: 'Error fetching donation statistics' });
  }
};

module.exports = {
  createDonation,
  getDonations,
  getMemberDonations,
  getDonationStats
};