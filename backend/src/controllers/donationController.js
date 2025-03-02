const pool = require('../config/database');
const { NotFoundError, ValidationError, InternalServerError } = require('../utils/errors');

const createDonation = async (req, res, next) => {
  const { memberId, type, items, notes } = req.body;
  const connection = await pool.getConnection();

  try {
    // Verify member exists
    const [member] = await connection.query('SELECT id FROM users WHERE id = ?', [memberId]);
    if (member.length === 0) {
      throw new NotFoundError('Member not found');
    }

    await connection.beginTransaction();

    // Calculate total amount from all items
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    // Insert main donation record
    const [donationResult] = await connection.query(
      'INSERT INTO donations (member_id, type, total_amount, notes) VALUES (?, ?, ?, ?)',
      [memberId, type, totalAmount, notes]
    );
    const donationId = donationResult.insertId;

    // Insert all donation items
    for (const item of items) {
      // Verify sacrament exists and has enough inventory
      const [sacrament] = await connection.query(
        'SELECT id, num_active FROM sacraments WHERE id = ?',
        [item.sacramentId]
      );

      if (sacrament.length === 0) {
        throw new NotFoundError(`Sacrament with ID ${item.sacramentId} not found`);
      }

      if (sacrament[0].num_active < item.quantity) {
        throw new ValidationError(`Insufficient inventory for sacrament ID ${item.sacramentId}`);
      }

      await connection.query(
        'INSERT INTO donation_items (donation_id, sacrament_id, quantity, amount) VALUES (?, ?, ?, ?)',
        [donationId, item.sacramentId, item.quantity, item.amount]
      );

      // Update sacrament inventory
      await connection.query(
        'UPDATE sacraments SET num_active = num_active - ? WHERE id = ?',
        [item.quantity, item.sacramentId]
      );
    }

    await connection.commit();

    // Fetch the complete donation with items for response
    const [donation] = await connection.query(`
      SELECT d.*, u.first_name, u.last_name
      FROM donations d
      JOIN users u ON d.member_id = u.id
      WHERE d.id = ?
    `, [donationId]);

    const [donationItems] = await connection.query(`
      SELECT di.*, s.name as sacrament_name
      FROM donation_items di
      JOIN sacraments s ON di.sacrament_id = s.id
      WHERE di.donation_id = ?
    `, [donationId]);

    res.status(201).json({
      ...donation[0],
      memberName: `${donation[0].first_name} ${donation[0].last_name}`,
      items: donationItems
    });

  } catch (error) {
    await connection.rollback();
    next(error); // Pass to error handler
  } finally {
    connection.release();
  }
};

const getDonations = async (req, res) => {
  try {
    const [donations] = await pool.query(`
      SELECT
        d.*,
        CONCAT(u.first_name, ' ', u.last_name) as member_name,
        GROUP_CONCAT(CONCAT(s.name, ' (', di.quantity, ')')) as sacrament_names
      FROM donations d
      JOIN users u ON d.member_id = u.id
      LEFT JOIN donation_items di ON d.id = di.donation_id
      LEFT JOIN sacraments s ON di.sacrament_id = s.id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `);

    console.log('Fetched donations:', donations); // Debug log
    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({
      message: 'Error fetching donations',
      error: error.message
    });
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