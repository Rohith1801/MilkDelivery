const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, MilkDelivery, MilkRate, Payment } = require('../models');
const { authenticateToken, requireUser } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, requireUser, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.user_id,
        name: req.user.name,
        email: req.user.email,
        address: req.user.address
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  authenticateToken,
  requireUser,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('address').optional().trim().isLength({ min: 10 }).withMessage('Address must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (address) updateData.address = address;

    await req.user.update(updateData);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user.user_id,
        name: req.user.name,
        email: req.user.email,
        address: req.user.address
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/deliveries
// @desc    Get user's delivery history
// @access  Private
router.get('/deliveries', authenticateToken, requireUser, async (req, res) => {
  try {
    const { month, year } = req.query;
    const whereClause = { user_id: req.user.user_id };

    if (month && year) {
      whereClause.delivery_date = {
        [require('sequelize').Op.and]: [
          { [require('sequelize').Op.gte]: new Date(year, month - 1, 1) },
          { [require('sequelize').Op.lt]: new Date(year, month, 1) }
        ]
      };
    }

    const deliveries = await MilkDelivery.findAll({
      where: whereClause,
      include: [{
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

// @route   GET /api/users/stats
// @desc    Get user's monthly statistics
// @access  Private
router.get('/stats', authenticateToken, requireUser, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const deliveries = await MilkDelivery.findAll({
      where: {
        user_id: req.user.user_id,
        delivery_date: {
          [require('sequelize').Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: MilkRate,
        as: 'milkRate',
        attributes: ['quantity', 'price']
      }]
    });

    const totalMilk = deliveries.reduce((sum, delivery) => sum + delivery.quantity, 0);
    const totalAmount = deliveries.reduce((sum, delivery) => sum + parseFloat(delivery.total_price), 0);

    res.json({
      month: currentMonth,
      year: currentYear,
      totalMilk,
      totalAmount,
      deliveryCount: deliveries.length
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/payments
// @desc    Get user's payment history
// @access  Private
router.get('/payments', authenticateToken, requireUser, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { user_id: req.user.user_id },
      order: [['createdAt', 'DESC']]
    });

    res.json({ payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

