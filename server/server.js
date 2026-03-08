const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
require('dotenv').config();

const app = express();

// Middleware พื้นฐาน
app.use(cors()); // ยอมรับ Request จาก Frontend (React)
app.use(express.json({ limit: '10mb' })); // เพิ่ม limit สำหรับรูปภาพ Base64
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ทดสอบเชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ เชื่อมต่อ MongoDB สำเร็จแล้ว!'))
    .catch((err) => console.error('❌ ต่อ MongoDB ไม่ติด:', err));

// กำหนด Path หลักให้ API Auth
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);


// สร้าง Route พื้นฐานไว้เทสว่า API ทำงานไหม
app.get('/', (req, res) => {
    res.send('🚀 StellarServe API is running!');
});

// กำหนด Port และสั่ง Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server วิ่งอยู่ที่ Port: ${PORT}`);
});