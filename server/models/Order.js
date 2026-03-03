const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // ตอนแรกยังไม่มีคนรับงาน
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
      quantity: { type: Number, required: true, default: 1 }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'delivering', 'completed'],
    default: 'pending' // พอสั่งปุ๊บ สถานะเริ่มที่รอร้านกดรับ
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);