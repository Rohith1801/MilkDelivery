const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Use SQLite for quick testing if MySQL is not available
const useSQLite = process.env.USE_SQLITE === 'true' || !process.env.DB_HOST;

const sequelize = useSQLite 
  ? new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../milk_delivery.db'),
      logging: false
    })
  : new Sequelize(
      process.env.DB_NAME || 'milk_delivery_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false, // Set to console.log to see SQL queries
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

module.exports = sequelize;

