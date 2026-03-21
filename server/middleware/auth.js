const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not set in environment variables');

const verifyToken = (req, res, next) => {
    // ดึง Token จาก Header 'Authorization'
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: ไม่พบ Token หรือรูปแบบไม่ถูกต้อง' });
    }

    // ตัดคำว่า 'Bearer ' ออกเพื่อเอาแค่ตัว Token
    const token = authHeader.split(' ')[1];

    try {
        // ตรวจสอบความถูกต้องของ Token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // ยัดข้อมูลที่ถอดรหัสได้ (เช่น userId, role) ลงใน req.user เพื่อให้ API อื่นๆ นำไปใช้ต่อได้
        req.user = decoded;
        
        // อนุญาตให้ผ่านไปยัง Route ถัดไป
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Forbidden: Token หมดอายุหรือไม่ถูกต้อง' });
    }
};

module.exports = { verifyToken };
