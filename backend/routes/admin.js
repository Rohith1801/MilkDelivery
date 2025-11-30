const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, MilkDelivery, MilkRate, Payment } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    // Get total users
    const totalUsers = await User.count({ where: { role: 'user' } });

    // Get monthly deliveries
    const monthlyDeliveries = await MilkDelivery.findAll({
      where: {
        delivery_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }, {
        model: MilkRate,
        as: 'milkRate',
        attributes: ['quantity', 'price']
      }]
    });

    // Get daily deliveries for calendar
    const dailyDeliveries = await MilkDelivery.findAll({
      where: {
        delivery_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'delivery_date',
        [require('sequelize').fn('COUNT', require('sequelize').col('delivery_id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_price')), 'total_amount']
      ],
      group: ['delivery_date'],
      order: [['delivery_date', 'ASC']]
    });

    // Get payment statistics
    const paidPayments = await Payment.count({
      where: {
        status: 'paid',
        payment_date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    const pendingPayments = await Payment.count({
      where: {
        status: 'pending',
        payment_date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Calculate total revenue
    const totalRevenue = monthlyDeliveries.reduce((sum, delivery) => sum + parseFloat(delivery.total_price), 0);

    res.json({
      month: currentMonth,
      year: currentYear,
      totalUsers,
      totalDeliveries: monthlyDeliveries.length,
      totalRevenue,
      paidPayments,
      pendingPayments,
      dailyDeliveries
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: 'user' },
      attributes: ['user_id', 'name', 'email', 'address', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/deliveries
// @desc    Get all deliveries with filters
// @access  Private (Admin only)
router.get('/deliveries', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { date, user_id, status } = req.query;
    const whereClause = {};

    if (date) {
      whereClause.delivery_date = date;
    }
    if (user_id) {
      whereClause.user_id = user_id;
    }

    const deliveries = await MilkDelivery.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }, {
        model: MilkRate,
        as: 'milkRate',
        attributes: ['quantity', 'price']
      }],
      order: [['delivery_date', 'DESC']]
    });

    res.json({ deliveries });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/payments
// @desc    Get all payments
// @access  Private (Admin only)
router.get('/payments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/milk-rates/:id
// @desc    Update milk rate
// @access  Private (Admin only)
router.put('/milk-rates/:id', [
  authenticateToken,
  requireAdmin,
  body('price').isDecimal().withMessage('Valid price required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { price, notes } = req.body;

    const milkRate = await MilkRate.findByPk(id);
    if (!milkRate) {
      return res.status(404).json({ message: 'Milk rate not found' });
    }

    await milkRate.update({ price, notes });

    res.json({
      message: 'Milk rate updated successfully',
      milkRate
    });
  } catch (error) {
    console.error('Update milk rate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/milk-rates
// @desc    Get all milk rates
// @access  Private (Admin only)
router.get('/milk-rates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const milkRates = await MilkRate.findAll({
      order: [['quantity', 'ASC']]
    });

    res.json({ milkRates });
  } catch (error) {
    console.error('Get milk rates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/milk-rates
// @desc    Create new milk rate
// @access  Private (Admin only)
router.post('/milk-rates', [
  authenticateToken,
  requireAdmin,
  body('quantity').isInt().withMessage('Valid quantity required'),
  body('price').isDecimal().withMessage('Valid price required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quantity, price, notes } = req.body;

    // Check if quantity already exists
    const existingRate = await MilkRate.findOne({ where: { quantity } });
    if (existingRate) {
      return res.status(400).json({ message: 'Milk rate for this quantity already exists' });
    }

    const milkRate = await MilkRate.create({
      quantity,
      price,
      notes
    });

    res.status(201).json({
      message: 'Milk rate created successfully',
      milkRate
    });
  } catch (error) {
    console.error('Create milk rate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


