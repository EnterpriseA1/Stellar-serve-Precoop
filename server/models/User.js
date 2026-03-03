const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: {
    type: String,
    enum: ['customer', 'restaurant'], // บังคับว่าต้องเป็น 2 ค่านี้เท่านั้น
    required: true
  },
  // สำหรับร้านค้า อาจจะเก็บชื่อร้านไว้ใน name เลย หรือเพิ่มฟิลด์ address ก็ได้ครับ
  address: { type: String }
}, { timestamps: true }); // timestamps จะช่วยสร้าง createdAt, updatedAt ให้อัตโนมัติ

module.exports = mongoose.model('User', userSchema);