const pool = require('../database');

async function seedDonations() {
  const connection = await pool.getConnection();
  try {
    // Get member IDs
    const [members] = await connection.query('SELECT id FROM users WHERE role = "member" LIMIT 5');
    const [sacraments] = await connection.query('SELECT id FROM sacraments LIMIT 5');

    // Create donations
    const donations = [
      { memberId: members[0].id, type: 'cash', notes: 'cash payment', amount: 50.00 },
      { memberId: members[1].id, type: 'card', notes: 'card payment', amount: 70.00 },
      { memberId: members[2].id, type: 'cash', notes: 'cash payment', amount: 45.00 },
      { memberId: members[3].id, type: 'other', notes: 'other payment', amount: 40.00 },
      { memberId: members[4].id, type: 'card', notes: 'card payment', amount: 45.00 }
    ];

    for (const donation of donations) {
      // Insert donation
      const [result] = await connection.query(`
        INSERT INTO donations (member_id, type, total_amount, notes, created_at)
        VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))
      `, [
        donation.memberId,
        donation.type,
        donation.amount,
        donation.notes,
        Math.floor(Math.random() * 5) // Random day in the last 5 days
      ]);

      // Add donation items
      const donationItems = [
        { sacramentId: sacraments[0].id, quantity: 2, amount: 25.00 },
        { sacramentId: sacraments[1].id, quantity: 1, amount: 30.00 },
        { sacramentId: sacraments[2].id, quantity: 2, amount: 20.00 }
      ];

      for (const item of donationItems) {
        await connection.query(`
          INSERT INTO donation_items (donation_id, sacrament_id, quantity, amount)
          VALUES (?, ?, ?, ?)
        `, [result.insertId, item.sacramentId, item.quantity, item.amount]);
      }
    }

    console.log('Donations and items seeded successfully');
  } catch (error) {
    console.error('Error seeding donations:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = seedDonations;