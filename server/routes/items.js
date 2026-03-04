const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// -----------------------------------------
// [POST] /api/items (ร้านค้าเพิ่มเมนูใหม่)
// -----------------------------------------
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, restaurantId } = req.body;

    // สร้างข้อมูลเมนูใหม่
    const newItem = new Item({
      name,
      description,
      price,
      category,
      restaurantId
    });

    await newItem.save();
    res.status(201).json({ message: 'เพิ่มเมนูอาหารสำเร็จ!', item: newItem });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มเมนู' });
  }
});

// -----------------------------------------
// [GET] /api/items (ดึงเมนูอาหารทั้งหมด - สำหรับลูกค้า)
// -----------------------------------------
router.get('/', async (req, res) => {
  try {
    // .populate() จะช่วยดึงข้อมูลชื่อร้าน (จากคอลเลกชัน User) มาแสดงด้วย
    const items = await Item.find().populate('restaurantId', 'name address');
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลเมนู' });
  }
});

// -----------------------------------------
// [GET] /api/items/restaurant/:id (ดึงเมนูเฉพาะของร้านนั้นๆ)
// -----------------------------------------
router.get('/restaurant/:id', async (req, res) => {
  try {
    const items = await Item.find({ restaurantId: req.params.id });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลเมนูของร้าน' });
  }
});

module.exports = router;