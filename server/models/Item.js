const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  // เก็บ ID ของ User (ที่ role เป็น restaurant) เพื่อให้รู้ว่าเมนูนี้เป็นของร้านไหน
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['burger', 'pizza', 'sushi', 'other'],
    required: true,
    default: 'other'
  },
  imageUrl: { type: String } // รูปเมนู (Base64)
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);