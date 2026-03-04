const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: {
    type: String,
    enum: ['customer', 'restaurant'],
    required: true
  },
  address: { type: String },
  isOpen: { type: Boolean, default: true }, // สถานะเปิด/ปิดร้าน (สำหรับ role: restaurant)
  category: {
    type: String,
    enum: ['burger', 'pizza', 'sushi', 'other', null],
    default: 'other'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
