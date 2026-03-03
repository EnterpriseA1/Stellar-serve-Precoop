const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  restaurantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // โยงไปหาคนที่เป็นเจ้าของเมนูนี้ (ร้านอาหาร)
    required: true 
  },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);