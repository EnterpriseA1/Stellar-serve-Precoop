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
    const { username, password, name, phone, role, address } = req.body;

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
      address // ใส่หรือไม่ใส่ก็ได้ (เหมาะกับร้านค้า)
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

    // หา User จาก Username
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
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดทางเซิร์ฟเวอร์' });
  }
});

module.exports = router;