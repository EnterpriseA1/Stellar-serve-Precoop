const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');

// -----------------------------------------
// [POST] /api/reviews (สร้างรีวิวสำหรับออเดอร์)
// -----------------------------------------
router.post('/', async (req, res) => {
    try {
        const { orderId, customerId, restaurantId, rating, comment } = req.body;

        if (!orderId || !customerId || !restaurantId || rating == null) {
            return res.status(400).json({ message: 'ข้อมูลรีวิวไม่ครบถ้วน' });
        }

        // ตรวจสอบว่าออเดอร์นี้มีอยู่จริงและเป็นของลูกค้ารายนี้หรือไม่
        const order = await Order.findOne({ _id: orderId, customerId, restaurantId });
        if (!order) {
            return res.status(404).json({ message: 'ไม่พบออเดอร์นี้' });
        }

        // ตรวจสอบสถานะว่าต้องเป็น completed เท่านั้นถึงรีวิวได้
        if (order.status !== 'completed') {
            return res.status(400).json({ message: 'ลูกค้าสามารถรีวิวได้เฉพาะออเดอร์ที่เสร็จสมบูรณ์แล้ว' });
        }

        // ตรวจสอบว่าเคยรีวิวออเดอร์นี้ไปแล้วหรือไม่
        const existingReview = await Review.findOne({ orderId });
        if (existingReview) {
            return res.status(400).json({ message: 'คุณได้รีวิวออเดอร์นี้ไปแล้ว' });
        }

        const newReview = new Review({
            orderId,
            customerId,
            restaurantId,
            rating,
            comment: comment || ''
        });

        await newReview.save();

        res.status(201).json({
            message: 'ส่งรีวิวสำเร็จ!',
            review: newReview
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'คุณได้รีวิวออเดอร์นี้ไปแล้ว' });
        }
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกรีวิว' });
    }
});

// -----------------------------------------
// [GET] /api/reviews/restaurant/:restaurantId (ดึงรีวิวทั้งหมดของร้าน)
// -----------------------------------------
router.get('/restaurant/:restaurantId', async (req, res) => {
    try {
        const reviews = await Review.find({ restaurantId: req.params.restaurantId })
            .populate('customerId', 'name imageUrl')
            .sort({ createdAt: -1 }); // ล่าสุดขึ้นก่อน
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงรีวิว' });
    }
});

// -----------------------------------------
// [GET] /api/reviews/order/:orderId (ดึงรีวิวของออเดอร์ ถ้ามี)
// -----------------------------------------
router.get('/order/:orderId', async (req, res) => {
    try {
        const review = await Review.findOne({ orderId: req.params.orderId });
        if (!review) {
            return res.status(404).json({ message: 'ยังไม่มีรีวิว' });
        }
        res.json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบรีวิว' });
    }
});

module.exports = router;
