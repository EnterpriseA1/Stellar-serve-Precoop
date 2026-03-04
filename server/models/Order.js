const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      name: { type: String, required: true },   // snapshot ชื่อเมนู ณ เวลาที่สั่ง
      price: { type: Number, required: true },   // snapshot ราคา ณ เวลาที่สั่ง
      quantity: { type: Number, required: true, default: 1 }
    }
  ],
  totalPrice: { type: Number, required: true },
  deliveryAddress: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'delivering', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
