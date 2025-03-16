const pool = require('../config/database');
const { ValidationError } = require('../utils/errors');

const getAllMembers = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [members] = await connection.query(
      `SELECT id, email, first_name, last_name, role,
      membership_type, membership_status, birth_date,
      phone_number, membership_expiration, last_check_in
      FROM users WHERE role = "member"`
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
      `SELECT id, email, first_name, last_name, role,
      membership_type, membership_status, birth_date,
      phone_number, membership_expiration, last_check_in
      FROM users WHERE id = ?`,
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
    const {
      firstName,
      lastName,
      email,
      birthDate,
      phoneNumber,
      membershipType
    } = req.body;

    const connection = await pool.getConnection();

    // Check if member exists
    const [existingMember] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [req.params.id]
    );

    if (existingMember.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Member not found' });
    }

    // Calculate age to determine membership status
    let membershipStatus = 'Active';
    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }

      if (age < 21) {
        membershipStatus = 'Pending';
      }
    }

    // Calculate membership expiration (1 year from now)
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    await connection.query(
      `UPDATE users SET
      first_name = ?,
      last_name = ?,
      email = ?,
      birth_date = ?,
      phone_number = ?,
      membership_type = ?,
      membership_status = ?,
      membership_expiration = ?
      WHERE id = ?`,
      [
        firstName,
        lastName,
        email,
        birthDate || null,
        phoneNumber || null,
        membershipType || 'Exploratory',
        membershipStatus,
        expirationDate.toISOString().split('T')[0],
        req.params.id
      ]
    );
    connection.release();

    res.json({
      message: 'Member profile updated successfully',
      membershipStatus
    });
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
    const { id } = req.params;

    const connection = await pool.getConnection();

    // Start a transaction to ensure all deletions succeed or fail together
    await connection.beginTransaction();

    try {
      // Delete check-ins
      await connection.query('DELETE FROM check_ins WHERE user_id = ?', [id]);

      // Delete donation items related to this member's donations
      await connection.query(
        'DELETE di FROM donation_items di JOIN donations d ON di.donation_id = d.id WHERE d.member_id = ?',
        [id]
      );

      // Delete donations
      await connection.query('DELETE FROM donations WHERE member_id = ?', [id]);

      // Delete inventory transfers recorded by this member
      await connection.query('DELETE FROM inventory_transfers WHERE recorded_by = ?', [id]);

      // Delete inventory audits performed by this member
      await connection.query('DELETE FROM inventory_audits WHERE audited_by = ?', [id]);

      // Finally, delete the member
      const [result] = await connection.query('DELETE FROM users WHERE id = ?', [id]);

      // Commit the transaction
      await connection.commit();

      connection.release();

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Member not found' });
      }

      res.json({ message: 'Member deleted successfully' });
    } catch (error) {
      // If any query fails, roll back the transaction
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteMember:', error);
    res.status(500).json({ message: 'Error deleting member' });
  }
};

const getCheckIns = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Check if member exists
    const [existingMember] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [req.params.id]
    );

    if (existingMember.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Member not found' });
    }

    // Get check-ins for this member
    const [checkIns] = await connection.query(
      `SELECT id, user_id, timestamp
       FROM check_ins
       WHERE user_id = ?
       ORDER BY timestamp DESC`,
      [req.params.id]
    );

    connection.release();
    res.json(checkIns);
  } catch (error) {
    console.error('Error in getCheckIns:', error);
    res.status(500).json({ message: 'Error fetching check-ins' });
  }
};

const checkIn = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Check if user has already checked in today
    const [existingCheckIn] = await connection.query(
      'SELECT id FROM check_ins WHERE user_id = ? AND DATE(timestamp) = CURDATE()',
      [id]
    );

    if (existingCheckIn.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'User has already checked in today' });
    }

    // Create new check-in if no existing check-in today
    const [result] = await connection.query(
      'INSERT INTO check_ins (user_id) VALUES (?)',
      [id]
    );

    connection.release();
    res.json({ message: 'Check-in recorded successfully' });
  } catch (error) {
    console.error('Error in checkIn:', error);
    res.status(500).json({ message: 'Error recording check-in' });
  }
};

const deleteCheckIn = async (req, res) => {
  try {
    const { checkInId } = req.params;
    const connection = await pool.getConnection();

    await connection.query(
      'DELETE FROM check_ins WHERE id = ?',
      [checkInId]
    );

    connection.release();
    res.json({ message: 'Check-in deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCheckIn:', error);
    res.status(500).json({ message: 'Error deleting check-in' });
  }
};

const getRecentCheckIns = async (req, res) => {
  try {
    const [recentCheckIns] = await pool.query(`
      SELECT DISTINCT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        c.timestamp as last_check_in
      FROM users u
      JOIN check_ins c ON u.id = c.user_id
      WHERE c.timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY c.timestamp DESC
      LIMIT 10
    `);

    res.json(recentCheckIns);
  } catch (error) {
    console.error('Error fetching recent check-ins:', error);
    res.status(500).json({ message: 'Error fetching recent check-ins' });
  }
};

const updateMembership = async (req, res) => {
  try {
    const { membershipType, membershipStatus, expirationDate } = req.body;
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
      `UPDATE users SET
      membership_type = ?,
      membership_status = ?,
      membership_expiration = ?
      WHERE id = ?`,
      [
        membershipType,
        membershipStatus,
        expirationDate,
        req.params.id
      ]
    );
    connection.release();

    res.json({ message: 'Membership details updated successfully' });
  } catch (error) {
    console.error('Error in updateMembership:', error);
    res.status(500).json({ message: 'Error updating membership details' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'Active', 'Expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const connection = await pool.getConnection();

    // Update the member's status
    await connection.query(
      'UPDATE users SET membership_status = ? WHERE id = ?',
      [status, id]
    );

    // If status is Active, set membership expiration to 1 year from now
    if (status === 'Active') {
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      const formattedExpirationDate = expirationDate.toISOString().split('T')[0];

      await connection.query(
        'UPDATE users SET membership_expiration = ? WHERE id = ?',
        [formattedExpirationDate, id]
      );
    }

    connection.release();

    res.status(200).json({ message: 'Member status updated successfully' });
  } catch (error) {
    console.error('Error updating member status:', error);
    res.status(500).json({ message: 'Error updating member status' });
  }
};

module.exports = {
  getAllMembers,
  getMemberById,
  updateMemberProfile,
  checkInMember,
  updateSubscription,
  getMemberStats,
  deleteMember,
  getCheckIns,
  checkIn,
  deleteCheckIn,
  getRecentCheckIns,
  updateMembership,
  updateStatus
};