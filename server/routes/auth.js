const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret Key (เอาไว้เข้ารหัส Token - ปกติควรเอาไปไว้ในไฟล์ .env)
const JWT_SECRET = process.env.JWT_SECRET || 'stellarserve_super_secret_key';

// -----------------------------------------
// [POST] /api/auth/register (สมัครสมาชิก)
// -----------------------------------------
router.post('/register', async (req, res) => {
    try {
        const { username, password, name, phone, role, address, category } = req.body;

        // เช็คว่ามี Username นี้ในระบบหรือยัง
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username นี้มีคนใช้แล้วครับ' });
        }

        // เข้ารหัส Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // สร้าง User ใหม่
        const newUser = new User({
            username,
            password: hashedPassword,
            name,
            phone,
            role,
            address, // ใส่หรือไม่ใส่ก็ได้ (เหมาะกับร้านค้า)
            category: role === 'restaurant' ? (category || 'other') : undefined
        });

        await newUser.save();
        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดทางเซิร์ฟเวอร์' });
    }
});

// -----------------------------------------
// [POST] /api/auth/login (เข้าสู่ระบบ)
// -----------------------------------------
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // หา User จาก Username (case-sensitive)
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'ไม่พบ Username นี้ในระบบ' });
        }

        // เทียบ Password ที่ส่งมากับที่เข้ารหัสไว้ใน Database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
        }

        // สร้าง Token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' } // ให้ Token หมดอายุใน 1 วัน
        );

        // ส่ง Token และข้อมูล User กลับไปให้ Frontend
        res.json({
            message: 'ล็อกอินสำเร็จ',
            token,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                phone: user.phone,
                address: user.address,
                role: user.role,
                isOpen: user.isOpen,
                imageUrl: user.imageUrl || null, // รูปโปรไฟล์/ร้าน
                category: user.category || null
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดทางเซิร์ฟเวอร์' });
    }
});

// -----------------------------------------
// [GET] /api/auth/restaurants (ดึงร้านอาหารที่เปิดอยู่เท่านั้น)
// -----------------------------------------
router.get('/restaurants', async (req, res) => {
    try {
        const restaurants = await User.find(
            { role: 'restaurant', isOpen: true }, // เฉพาะร้านที่เปิดอยู่
            { password: 0 } // ไม่ส่งรหัสผ่าน แต่อื่นๆ รวม category ส่งไปหมด
        );
        res.json(restaurants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลร้านอาหาร' });
    }
});

// -----------------------------------------
// [GET] /api/auth/restaurants/:id/status (ดึงสถานะเปิด/ปิดของร้าน)
// -----------------------------------------
router.get('/restaurants/:id/status', async (req, res) => {
    try {
        const restaurant = await User.findById(req.params.id, { isOpen: 1 });
        if (!restaurant) return res.status(404).json({ message: 'ไม่พบร้านอาหาร' });
        res.json({ isOpen: restaurant.isOpen ?? true });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// -----------------------------------------
// [PATCH] /api/auth/restaurants/:id/toggle (เปิด/ปิดร้าน)
// -----------------------------------------
router.patch('/restaurants/:id/toggle', async (req, res) => {
    try {
        // ดึงสถานะปัจจุบันก่อน (isOpen อาจ undefined ใน document เก่า → ถือว่า true)
        const restaurant = await User.findById(req.params.id);
        if (!restaurant || restaurant.role !== 'restaurant') {
            return res.status(404).json({ message: 'ไม่พบร้านอาหารนี้' });
        }

        const currentIsOpen = restaurant.isOpen ?? true; // ถ้า undefined ให้ถือว่าเปิดอยู่
        const newIsOpen = !currentIsOpen;

        // อัปเดตด้วย findByIdAndUpdate เพื่อให้ได้ค่าใหม่แน่นอน
        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { isOpen: newIsOpen },
            { returnDocument: 'after' }
        );

        res.json({
            message: `ร้านของคุณ${updated.isOpen ? 'เปิด' : 'ปิด'}แล้ว`,
            isOpen: updated.isOpen
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ' });
    }
});

// -----------------------------------------
// [PATCH] /api/auth/profile/:id (อัปเดตข้อมูลโปรไฟล์)
// -----------------------------------------
router.patch('/profile/:id', async (req, res) => {
    try {
        const { name, phone, address, imageUrl } = req.body;

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { name, phone, address, imageUrl },
            { returnDocument: 'after', select: '-password' }
        );

        if (!updated) return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' });

        res.json({ message: 'อัปเดตโปรไฟล์สำเร็จ', user: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์' });
    }
});


module.exports = router;
