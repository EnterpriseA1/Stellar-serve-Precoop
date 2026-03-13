const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { verifyToken } = require('../middleware/auth');

// -----------------------------------------
// [GET] /api/cart/:customerId (ดึงตะกร้าของ User)
// -----------------------------------------
router.get('/:customerId', verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ customerId: req.params.customerId });
        if (!cart) {
            return res.json({ restaurantId: null, items: [] });
        }
        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้า' });
    }
});

// -----------------------------------------
// [POST] /api/cart/sync (อัปเดตหรือสร้างตะกร้าใหม่ทั้งก้อน)
// -----------------------------------------
router.post('/sync', verifyToken, async (req, res) => {
    try {
        const { customerId, restaurantId, items } = req.body;

        if (!customerId) {
            return res.status(400).json({ message: 'ไม่พบข้อมูล User' });
        }

        // กรณี items ว่างเปล่า = เคลียร์ตะกร้า ฝั่ง Frontend จะส่ง restaurantId มาเป็น null ก็ได้
        if (!items || items.length === 0) {
            await Cart.findOneAndDelete({ customerId });
            return res.json({ message: 'ลบตะกร้าเรียบร้อยแล้ว' });
        }

        // ค้นหาว่ามีตะกร้าเดิมไหม ถ้ามีก็ Update ถ้าไม่มีก็ Create แบบ Atomic
        const updatedCart = await Cart.findOneAndUpdate(
            { customerId },
            {
                $set: {
                    restaurantId,
                    items
                }
            },
            { new: true, upsert: true }
        );

        res.json({ message: 'อัปเดตตะกร้าเรียบร้อย', cart: updatedCart });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตตะกร้า' });
    }
});

module.exports = router;
