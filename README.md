# Stellar-serve-Precoop


# StellarServe

## 🌟 Core Features
* **ระบบยืนยันตัวตน (Authentication):** รองรับการเข้าสู่ระบบและสมัครสมาชิก พร้อมการเข้ารหัสรหัสผ่านและการจัดการเซสชันด้วย JWT
* **การจัดการสินค้า/เมนู (Items Management):** ระบบจัดการข้อมูลสินค้าภายในแอปพลิเคชัน
* **ระบบตะกร้าสินค้า (Shopping Cart):** ผู้ใช้สามารถเพิ่มและจัดการสินค้าในตะกร้าได้
* **การจัดการคำสั่งซื้อ (Order Management):** ระบบสำหรับสร้างและจัดการออเดอร์
* **ระบบรีวิว (Review System):** รองรับการให้คะแนนและเขียนรีวิวสินค้า

## 💻 Tech Stack
**Frontend (Client):**
* React (v19)
* Vite
* React Router DOM (v7)
* Tailwind CSS (v4)
* Axios

**Backend (Server):**
* Node.js & Express.js (v5)
* MongoDB & Mongoose (v9)
* JSON Web Token (JWT) & bcryptjs
* CORS & dotenv

## 🏛️ System Flow Architecture

```mermaid
graph TD
    User["👨‍💻 User"]
    Frontend["💻 Frontend: React + Vite (Port: 5173)"]
    Backend["⚙️ Backend: Express API (Port: 5000)"]
    Database[("🗄️ Database: MongoDB")]

    User -->|"ใช้งานบนเบราว์เซอร์"| Frontend
    Frontend -->|"ส่ง HTTP Request (Axios)"| Backend
    Backend -->|"อ่าน/เขียนข้อมูล"| Database
    Database -->|"ส่งคืนผลลัพธ์"| Backend
    Backend -->|"ส่ง JSON Response"| Frontend
    Frontend -->|"อัปเดตหน้าจอ"| User
```
📂 Project Structure
/client - โค้ดส่วน Frontend (React + Vite) หน้าหลักประกอบด้วยหน้า Login, Signup และ Home

/server - โค้ดส่วน Backend API (Express.js) แบ่ง Routes หลักออกเป็น auth, items, orders, reviews, และ cart

🚀 Setup and Installation
Prerequisites:

Node.js

MongoDB (ทำงานแบบ Local หรือใช้งาน MongoDB Atlas)

1. Backend Setup (/server)

Bash
cd server
npm install
สร้างไฟล์ .env ที่ root ของโฟลเดอร์ /server และใส่ค่าตัวแปรดังนี้:

ข้อมูลโค้ด
PORT=5000
MONGO_URI=your_mongodb_connection_string
(เซิร์ฟเวอร์จะใช้ตัวแปรเหล่านี้ในการเชื่อมต่อฐานข้อมูลและตั้งค่าพอร์ต)

รันเซิร์ฟเวอร์ (โหมด Dev):

Bash
npm run dev
2. Frontend Setup (/client)

Bash
cd client
npm install
รัน Frontend:

Bash
npm run dev
เข้าใช้งานแอปพลิเคชันได้ที่ http://localhost:5173

🔗 Key REST API Endpoints
GET / - ตรวจสอบสถานะการทำงานของ API

/api/auth - จัดการระบบเข้าสู่ระบบ/สมัครสมาชิก

/api/items - จัดการข้อมูลสินค้าและเมนู

/api/orders - จัดการคำสั่งซื้อ

/api/reviews - จัดการรีวิวจากผู้ใช้

/api/cart - จัดการระบบตะกร้าสินค้า
