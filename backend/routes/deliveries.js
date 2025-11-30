const express = require('express');
const { body, validationResult } = require('express-validator');
const { MilkDelivery, MilkRate, User } = require('../models');
const { authenticateToken, requireUser } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/deliveries/options
// @desc    Get available milk delivery options
// @access  Private
router.get('/options', authenticateToken, async (req, res) => {
  try {
    const milkOptions = await MilkRate.findAll({
      order: [['quantity', 'ASC']]
    });

    res.json({ milkOptions });
  } catch (error) {
    console.error('Get milk options error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/deliveries/order
// @desc    Place a milk delivery order
// @access  Private
router.post('/order', [
  authenticateToken,
  requireUser,
  body('milk_id').isInt().withMessage('Valid milk option required'),
  body('delivery_time').isIn(['morning', 'evening']).withMessage('Delivery time must be morning or evening'),
  body('delivery_date').isISO8601().withMessage('Valid delivery date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { milk_id, delivery_time, delivery_date } = req.body;

    // Get milk rate details
    const milkRate = await MilkRate.findByPk(milk_id);
    if (!milkRate) {
      return res.status(400).json({ message: 'Invalid milk option' });
    }

    // Check if delivery already exists for this user on this date and time
    const existingDelivery = await MilkDelivery.findOne({
      where: {
        user_id: req.user.user_id,
        delivery_date,
        delivery_time
      }
    });

    if (existingDelivery) {
      return res.status(400).json({ message: 'Delivery already scheduled for this date and time' });
    }

    // Create delivery record
    const delivery = await MilkDelivery.create({
      user_id: req.user.user_id,
      milk_id,
      quantity: milkRate.quantity,
      delivery_time,
      delivery_date,
      total_price: milkRate.price
    });

    // Fetch the created delivery with associations
    const newDelivery = await MilkDelivery.findByPk(delivery.delivery_id, {
      include: [{
        model: MilkRate,
        as: 'milkRate',
        attributes: ['quantity', 'price']
      }]
    });

    res.status(201).json({
      message: 'Delivery order placed successfully',
      delivery: newDelivery
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/deliveries/:id
// @desc    Update a delivery order
// @access  Private
router.put('/:id', [
  authenticateToken,
  requireUser,
  body('milk_id').optional().isInt().withMessage('Valid milk option required'),
  body('delivery_time').optional().isIn(['morning', 'evening']).withMessage('Delivery time must be morning or evening'),
  body('delivery_date').optional().isISO8601().withMessage('Valid delivery date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const deliveryId = req.params.id;
    const { milk_id, delivery_time, delivery_date } = req.body;

    // Find the delivery
    const delivery = await MilkDelivery.findOne({
      where: {
        delivery_id: deliveryId,
        user_id: req.user.user_id
      }
    });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    const updateData = {};
    
    if (milk_id) {
      const milkRate = await MilkRate.findByPk(milk_id);
      if (!milkRate) {
        return res.status(400).json({ message: 'Invalid milk option' });
      }
      updateData.milk_id = milk_id;
      updateData.quantity = milkRate.quantity;
      updateData.total_price = milkRate.price;
    }
    
    if (delivery_time) updateData.delivery_time = delivery_time;
    if (delivery_date) updateData.delivery_date = delivery_date;

    await delivery.update(updateData);

    // Fetch updated delivery with associations
    const updatedDelivery = await MilkDelivery.findByPk(delivery.delivery_id, {
      include: [{
        model: MilkRate,
        as: 'milkRate',
        attributes: ['quantity', 'price']
      }]
    });

    res.json({
      message: 'Delivery updated successfully',
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error('Update delivery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/deliveries/:id
// @desc    Cancel a delivery order
// @access  Private
router.delete('/:id', authenticateToken, requireUser, async (req, res) => {
  try {
    const deliveryId = req.params.id;

    const delivery = await MilkDelivery.findOne({
      where: {
        delivery_id: deliveryId,
        user_id: req.user.user_id
      }
    });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    await delivery.destroy();

    res.json({ message: 'Delivery cancelled successfully' });
  } catch (error) {
    console.error('Cancel delivery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


