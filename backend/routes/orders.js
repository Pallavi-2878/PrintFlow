const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Place a new order
router.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, items, total, deliveryAddress, paymentMethod, design } = req.body;
    
    // Parse items and design if sent as strings (or use directly)
    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    const parsedDesign = typeof design === 'string' ? JSON.parse(design) : design;
    
    // Auto-generate custom order ID
    const orderId = `PF-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = new Order({
      id: orderId,
      customerName,
      customerPhone,
      deliveryAddress,
      items: parsedItems,
      design: parsedDesign,
      total: parseFloat(total),
      paymentMethod
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

// Fetch all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Printing', 'Completed', 'Delivered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

module.exports = router;
