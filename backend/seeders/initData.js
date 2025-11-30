const { User, MilkRate } = require('../models');
const bcrypt = require('bcryptjs');

const initializeData = async () => {
  try {
    // Create default admin user
    const adminExists = await User.findOne({ where: { email: 'admin@milkdelivery.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@milkdelivery.com',
        password: 'admin123', // Let the model hooks handle hashing
        address: 'Admin Office, Milk Delivery System',
        role: 'admin'
      });
      console.log('Admin user created');
    }

    // Create default milk rates
    const milkRates = [
      { quantity: 250, price: 12.50, notes: '250ml milk' },
      { quantity: 500, price: 25.00, notes: '500ml milk' },
      { quantity: 750, price: 37.50, notes: '750ml milk' },
      { quantity: 1000, price: 50.00, notes: '1L milk' },
      { quantity: 1500, price: 75.00, notes: '1.5L milk' },
      { quantity: 2000, price: 100.00, notes: '2L milk' }
    ];

    for (const rate of milkRates) {
      const existingRate = await MilkRate.findOne({ where: { quantity: rate.quantity } });
      if (!existingRate) {
        await MilkRate.create(rate);
      }
    }
    console.log('Milk rates initialized');

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

module.exports = initializeData;

