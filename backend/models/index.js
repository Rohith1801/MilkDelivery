const User = require('./User');
const MilkRate = require('./MilkRate');
const MilkDelivery = require('./MilkDelivery');
const Payment = require('./Payment');

// Define associations
User.hasMany(MilkDelivery, { foreignKey: 'user_id', as: 'deliveries' });
MilkDelivery.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

MilkRate.hasMany(MilkDelivery, { foreignKey: 'milk_id', as: 'deliveries' });
MilkDelivery.belongsTo(MilkRate, { foreignKey: 'milk_id', as: 'milkRate' });

User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  User,
  MilkRate,
  MilkDelivery,
  Payment
};


