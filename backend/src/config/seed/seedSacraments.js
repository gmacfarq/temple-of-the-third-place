const pool = require('../database');

const sacraments = [
  {
    name: 'Golden Teacher',
    type: 'chocolate',
    strain: 'Golden Teacher',
    description: 'Classic chocolate bar',
    num_storage: 100,
    num_active: 100,
    suggested_donation: 25.00
  },
  {
    name: 'Blue Meanies',
    type: 'dried_fruit',
    strain: 'Blue Meanies',
    description: 'Dried fruit blend',
    num_storage: 80,
    num_active: 80,
    suggested_donation: 30.00
  },
  {
    name: 'Peace Capsules',
    type: 'capsule',
    strain: 'Ghost PE',
    description: 'Measured capsules',
    num_storage: 150,
    num_active: 150,
    suggested_donation: 20.00
  },
  {
    name: 'Happy Gummies',
    type: 'gummy',
    strain: 'Ghost PE',
    description: 'Sweet gummy bears',
    num_storage: 120,
    num_active: 120,
    suggested_donation: 15.00
  },
  {
    name: 'Cosmic Tincture',
    type: 'tincture',
    strain: 'Ghost PE',
    description: 'Liquid extract',
    num_storage: 50,
    num_active: 50,
    suggested_donation: 40.00
  }
];

async function seedSacraments() {
  const connection = await pool.getConnection();
  try {
    // Check if sacraments already exist
    const [existingSacraments] = await connection.query('SELECT COUNT(*) as count FROM sacraments');

    if (existingSacraments[0].count > 0) {
      console.log('Sacraments already exist, skipping seed');
      return;
    }

    for (const sacrament of sacraments) {
      await connection.query(`
        INSERT INTO sacraments
        (name, type, strain, description, num_storage, num_active, suggested_donation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        sacrament.name,
        sacrament.type,
        sacrament.strain,
        sacrament.description,
        sacrament.num_storage,
        sacrament.num_active,
        sacrament.suggested_donation
      ]);
    }
    console.log('Sacraments seeded successfully');
  } catch (error) {
    console.error('Error seeding sacraments:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = seedSacraments;