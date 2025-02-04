const pool = require('../config/database');

const getAllMembers = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [members] = await connection.query(
      'SELECT id, email, first_name, last_name, role, subscription_status, last_check_in FROM users WHERE role = "member"'
    );
    connection.release();
    res.json(members);
  } catch (error) {
    console.error('Error in getAllMembers:', error);
    res.status(500).json({ message: 'Error fetching members' });
  }
};

const getMemberById = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [member] = await connection.query(
      'SELECT id, email, first_name, last_name, role, subscription_status, last_check_in FROM users WHERE id = ?',
      [req.params.id]
    );
    connection.release();

    if (member.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member[0]);
  } catch (error) {
    console.error('Error in getMemberById:', error);
    res.status(500).json({ message: 'Error fetching member' });
  }
};

const updateMemberProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const connection = await pool.getConnection();

    // Check if member exists
    const [existingMember] = await connection.query(
      'SELECT id FROM users WHERE id = ? AND role = "member"',
      [req.params.id]
    );

    if (existingMember.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Member not found' });
    }

    await connection.query(
      'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?',
      [firstName, lastName, email, req.params.id]
    );
    connection.release();

    res.json({ message: 'Member profile updated successfully' });
  } catch (error) {
    console.error('Error in updateMemberProfile:', error);
    res.status(500).json({ message: 'Error updating member profile' });
  }
};

const checkInMember = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Check if member exists
    const [existingMember] = await connection.query(
      'SELECT id FROM users WHERE id = ? AND role = "member"',
      [req.params.id]
    );

    if (existingMember.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Member not found' });
    }

    await connection.query(
      'UPDATE users SET last_check_in = CURRENT_TIMESTAMP WHERE id = ?',
      [req.params.id]
    );
    connection.release();
    res.json({ message: 'Check-in recorded successfully' });
  } catch (error) {
    console.error('Error in checkInMember:', error);
    res.status(500).json({ message: 'Error recording check-in' });
  }
};

const updateSubscription = async (req, res) => {
  try {
    const { status } = req.body;
    const connection = await pool.getConnection();

    // Validate subscription status
    const validStatuses = ['none', 'active', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid subscription status' });
    }

    // Check if member exists
    const [existingMember] = await connection.query(
      'SELECT id FROM users WHERE id = ? AND role = "member"',
      [req.params.id]
    );

    if (existingMember.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Member not found' });
    }

    await connection.query(
      'UPDATE users SET subscription_status = ? WHERE id = ?',
      [status, req.params.id]
    );
    connection.release();
    res.json({ message: 'Subscription status updated successfully' });
  } catch (error) {
    console.error('Error in updateSubscription:', error);
    res.status(500).json({ message: 'Error updating subscription status' });
  }
};

const getMemberStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get various member statistics
    const [stats] = await connection.query(`
      SELECT
        COUNT(*) as total_members,
        SUM(CASE WHEN subscription_status = 'active' THEN 1 ELSE 0 END) as active_subscriptions,
        SUM(CASE WHEN subscription_status = 'expired' THEN 1 ELSE 0 END) as expired_subscriptions,
        SUM(CASE WHEN last_check_in >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as active_last_30_days
      FROM users
      WHERE role = "member"
    `);

    connection.release();
    res.json(stats[0]);
  } catch (error) {
    console.error('Error in getMemberStats:', error);
    res.status(500).json({ message: 'Error fetching member statistics' });
  }
};
const deleteMember = async (req, res) => {
  try {
    // Check authorization first
    console.log('User role:', req.user.role); // Debug log

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const connection = await pool.getConnection();

    // Debug log
    console.log('Attempting to delete member:', req.params.id);

    // Then check if member exists
    const [existingMember] = await connection.query(
      'SELECT * FROM users WHERE id = ?',
      [req.params.id]
    );

    console.log('Found member:', existingMember[0]); // Debug log

    if (existingMember.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Member not found' });
    }

    await connection.query(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    );

    connection.release();
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error in deleteMember:', error);
    res.status(500).json({ message: 'Error deleting member' });
  }
};


module.exports = {
  getAllMembers,
  getMemberById,
  updateMemberProfile,
  checkInMember,
  updateSubscription,
  getMemberStats,
  deleteMember
};