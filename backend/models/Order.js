const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  fields: { type: mongoose.Schema.Types.Mixed, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  deliveryAddress: { type: String },
  items: [OrderItemSchema],
  design: {
    name: String,
    size: String,
    filePath: String
  },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'UPI' },
  status: { 
    type: String, 
    enum: ['Pending', 'Printing', 'Completed', 'Delivered'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
