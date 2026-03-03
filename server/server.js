const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware พื้นฐาน
app.use(cors()); // ยอมรับ Request จาก Frontend (React)
app.use(express.json()); // ให้ Express อ่านข้อมูลแบบ JSON ได้

// ทดสอบเชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ เชื่อมต่อ MongoDB สำเร็จแล้ว!'))
  .catch((err) => console.error('❌ ต่อ MongoDB ไม่ติด:', err));

// กำหนด Path หลักให้ API Auth
app.use('/api/auth', authRoutes);

// สร้าง Route พื้นฐานไว้เทสว่า API ทำงานไหม
app.get('/', (req, res) => {
  res.send('🚀 StellarServe API is running!');
});

// กำหนด Port และสั่ง Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server วิ่งอยู่ที่ Port: ${PORT}`);
});