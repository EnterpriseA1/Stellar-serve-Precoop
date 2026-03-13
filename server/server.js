const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const cartRoutes = require('./routes/cart');
require('dotenv').config();

const app = express();


// Middleware พื้นฐาน
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // ใส่ origin ของ Frontend
    credentials: true, // อนุญาตให้ส่ง Cookie หรือ Header Authorization
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
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
app.use('/api/cart', cartRoutes);


// สร้าง Route พื้นฐานไว้เทสว่า API ทำงานไหม
app.get('/', (req, res) => {
    res.send('🚀 StellarServe API is running!');
});

// กำหนด Port และสั่ง Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server วิ่งอยู่ที่ Port: ${PORT}`);
});