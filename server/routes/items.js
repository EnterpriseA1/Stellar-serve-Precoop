const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// -----------------------------------------
// [POST] /api/items (ร้านค้าเพิ่มเมนูใหม่)
// -----------------------------------------
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, restaurantId, imageUrl } = req.body;

    // สร้างข้อมูลเมนูใหม่
    const newItem = new Item({
      name,
      description,
      price,
      category,
      restaurantId,
      imageUrl
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

// -----------------------------------------
// [PUT] /api/items/update/:id (แก้ไขข้อมูลเมนู)
// -----------------------------------------
router.put('/update/:id', async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    // ค้นหาและอัปเดตข้อมูลตาม ID
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, imageUrl },
      { returnDocument: 'after' } // ให้คืนค่าข้อมูลตัวที่อัปเดตแล้วกลับมา
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'ไม่พบเมนูที่ต้องการแก้ไข' });
    }

    res.json({ message: 'แก้ไขเมนูสำเร็จ!', item: updatedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขเมนู' });
  }
});

// -----------------------------------------
// [DELETE] /api/items/delete/:id (ลบเมนูอาหาร)
// -----------------------------------------
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'ไม่พบเมนูที่ต้องการลบ' });
    }

    res.json({ message: 'ลบเมนูอาหารสำเร็จ!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบเมนู' });
  }
});

module.exports = router;