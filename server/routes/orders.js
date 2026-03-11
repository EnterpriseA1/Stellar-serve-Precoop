const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Item = require('../models/Item');
const { verifyToken } = require('../middleware/auth');

// -----------------------------------------
// [POST] /api/orders (ลูกค้าสั่งออเดอร์)
// -----------------------------------------
router.post('/', verifyToken, async (req, res) => {
    try {
        const { customerId, restaurantId, items, deliveryAddress } = req.body;

        if (!customerId || !restaurantId || !items || items.length === 0) {
            return res.status(400).json({ message: 'ข้อมูลออเดอร์ไม่ครบถ้วน' });
        }

        // คำนวณ totalPrice จาก items ที่ส่งมา (price × quantity) + ค่าส่ง 30 บาท
        const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 30;

        const newOrder = new Order({
            customerId,
            restaurantId,
            items: items.map(item => ({
                itemId: item.itemId,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            totalPrice,
            deliveryAddress: deliveryAddress || '',
            status: 'pending'
        });

        await newOrder.save();

        res.status(201).json({
            message: 'สั่งออเดอร์สำเร็จ!',
            order: newOrder
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสั่งออเดอร์' });
    }
});

// -----------------------------------------
// [GET] /api/orders/customer/:id (ลูกค้าดูประวัติออเดอร์ของตัวเอง)
// -----------------------------------------
router.get('/customer/:id', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.params.id })
            .populate('restaurantId', 'name address imageUrl')
            .sort({ createdAt: -1 }); // เรียงจากใหม่ → เก่า

        // Check which orders the user has already reviewed
        const Review = require('../models/Review');
        const reviews = await Review.find({ customerId: req.params.id }).select('orderId');
        const reviewedOrderIds = new Set(reviews.map(r => r.orderId.toString()));

        const ordersWithReviewStatus = orders.map(order => {
            const orderObj = order.toObject();
            orderObj.isReviewed = reviewedOrderIds.has(order._id.toString());
            return orderObj;
        });

        res.json(ordersWithReviewStatus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงออเดอร์' });
    }
});

// -----------------------------------------
// [GET] /api/orders/restaurant/:id (ร้านค้าดูออเดอร์ที่เข้ามา)
// -----------------------------------------
router.get('/restaurant/:id', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ restaurantId: req.params.id })
            .populate('customerId', 'name phone')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงออเดอร์' });
    }
});

// -----------------------------------------
// [PATCH] /api/orders/:id/status (ร้านค้าเปลี่ยนสถานะออเดอร์)
// -----------------------------------------
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'preparing', 'ready', 'delivering', 'completed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
        }

        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: 'ไม่พบออเดอร์นี้' });

        res.json({ message: `อัปเดตสถานะเป็น "${status}" สำเร็จ`, order: updated });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
    }
});

module.exports = router;
