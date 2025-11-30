const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MilkRate = sequelize.define('MilkRate', {
  milk_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Quantity in ml'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'milk_rates',
  timestamps: true
});

module.exports = MilkRate;


