const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MilkDelivery = sequelize.define('MilkDelivery', {
  delivery_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  milk_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'milk_rates',
      key: 'milk_id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Quantity in ml'
  },
  delivery_time: {
    type: DataTypes.ENUM('morning', 'evening'),
    allowNull: false
  },
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'milk_deliveries',
  timestamps: true
});

module.exports = MilkDelivery;


