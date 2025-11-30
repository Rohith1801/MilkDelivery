const express = require('express');
const { body, validationResult } = require('express-validator');
const { Payment, User, MilkDelivery } = require('../models');
const { authenticateToken, requireUser } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments
// @desc    Create a payment record
// @access  Private
router.post('/', [
  authenticateToken,
  requireUser,
  body('amount').isDecimal().withMessage('Valid amount required'),
  body('payment_method').optional().isString().withMessage('Payment method must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, payment_method, notes } = req.body;

    const payment = await Payment.create({
      user_id: req.user.user_id,
      amount,
      payment_method,
      notes,
      status: 'paid',
      payment_date: new Date()
    });

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payments/outstanding
// @desc    Get outstanding payment amount for user
// @access  Private
router.get('/outstanding', authenticateToken, requireUser, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    // Get total deliveries for the month
    const deliveries = await MilkDelivery.findAll({
      where: {
        user_id: req.user.user_id,
        delivery_date: {
          [require('sequelize').Op.between]: [startDate, endDate]
        }
      }
    });

    const totalDeliveries = deliveries.reduce((sum, delivery) => sum + parseFloat(delivery.total_price), 0);

    // Get total payments for the month
    const payments = await Payment.findAll({
      where: {
        user_id: req.user.user_id,
        status: 'paid',
        payment_date: {
          [require('sequelize').Op.between]: [startDate, endDate]
        }
      }
    });

    const totalPayments = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    const outstandingAmount = totalDeliveries - totalPayments;

    res.json({
      month: currentMonth,
      year: currentYear,
      totalDeliveries,
      totalPayments,
      outstandingAmount: Math.max(0, outstandingAmount)
    });
  } catch (error) {
    console.error('Get outstanding payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


