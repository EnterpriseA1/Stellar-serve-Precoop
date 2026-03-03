import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NavbarRestaurant from '../components/NavbarRestaurant';

export default function Home() {
    const [user, setUser] = useState(null);
    const [currentTab, setCurrentTab] = useState('home');
    const [cart, setCart] = useState([]); // cart state
    const navigate = useNavigate();

    // เพิ่มสินค้าลงตะกร้า
    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === item.id);
            if (existing) {
                return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    // ลดจำนวนหรือลบออกจากตะกร้า
    const removeFromCart = (itemId) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === itemId);
            if (existing?.qty === 1) return prev.filter(c => c.id !== itemId);
            return prev.map(c => c.id === itemId ? { ...c, qty: c.qty - 1 } : c);
        });
    };

    const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

    useEffect(() => {
        // เช็คว่ามีข้อมูล User ในเครื่องไหม (ล็อกอินหรือยัง)
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/'); // ถ้ายังไม่ล็อกอิน ให้เด้งกลับไปหน้า Sign In
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    if (!user) return <div className="p-10 text-center font-bold text-[#1a113d]">Loading...</div>;

    return (
        <div className="relative min-h-screen pb-20 bg-gray-50">

            {/* -------------------- พื้นที่ส่วนแสดงผลหลัก (Body) -------------------- */}
            <div>
                {currentTab === 'home' && (
                    // ถ้าอยู่หน้า Home ให้แสดง Dashboard ตาม Role เหมือนเดิม
                    <>
                        <div className="bg-[#1a113d] text-white p-6 rounded-b-3xl shadow-md flex justify-between items-center">
                            <div>
                                <h1 className="text-xl font-bold">Hello, {user.name}</h1>
                                <p className="inline-block px-2 py-1 mt-1 text-sm text-yellow-400 capitalize bg-white/20 rounded-lg">
                                    {user.role}
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            {user.role === 'customer' && <CustomerDashboard addToCart={addToCart} />}
                            {user.role === 'restaurant' && <RestaurantDashboard />}
                        </div>
                    </>
                )}

                {/* Cart */}
                {currentTab === 'cart' && <CartPage cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} setCurrentTab={setCurrentTab} />}

                {/* Search */}
                {currentTab === 'search' && <SearchPage />}

                {/* Profile */}
                {currentTab === 'profile' && <ProfilePage user={user} />}
            </div>

            {/* Navbar แยกตาม role */}
            {user.role === 'restaurant'
                ? <NavbarRestaurant currentTab={currentTab} setCurrentTab={setCurrentTab} />
                : <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} cartCount={cartCount} />
            }

        </div>
    );
}

// ==========================================
// ส่วน Components หน้าจอรอง (Search, Profile)
// ==========================================

function SearchPage() {
    return (
        <div className="p-6">
            <h2 className="mb-4 text-2xl font-bold text-[#1a113d]">Search</h2>
            <div className="relative">
                <input
                    type="text"
                    placeholder="ค้นหาร้านอาหาร หรือ เมนู..."
                    className="w-full px-5 py-3 pl-10 bg-white shadow-sm border-none rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <span className="absolute top-3 left-4 text-gray-400">🔍</span>
            </div>
            <div className="mt-8 text-center text-gray-400">
                <p>พิมพ์คำค้นหาเพื่อเริ่ม</p>
            </div>
        </div>
    );
}

function ProfilePage({ user }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="p-6">
            <h2 className="mb-6 text-2xl font-bold text-[#1a113d]">My Profile</h2>
            <div className="p-6 text-center bg-white rounded-3xl shadow-sm mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
                    👤
                </div>
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-gray-500">@{user.username}</p>
                <p className="mt-2 text-sm font-bold text-yellow-500 uppercase">{user.role}</p>
            </div>

            <div className="space-y-3">
                <button className="w-full p-4 text-left bg-white rounded-2xl shadow-sm font-bold flex justify-between">
                    <span>Account Settings</span>
                    <span className="text-gray-400">{'>'}</span>
                </button>
                <button className="w-full p-4 text-left bg-white rounded-2xl shadow-sm font-bold flex justify-between">
                    <span>Help Center</span>
                    <span className="text-gray-400">{'>'}</span>
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full p-4 mt-6 font-bold text-center text-white bg-red-500 rounded-full shadow hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

// ==========================================
// ส่วน Components ของ Dashboard ตาม Role (เหมือนเดิม)
// ==========================================

function CustomerDashboard({ addToCart }) {
    const [selectedRestaurant, setSelectedRestaurant] = React.useState(null);

    const mockRestaurants = [
        { id: 1, name: 'Burger House', category: '🍔 Burger', rating: 4.5, address: '123 Sukhumvit, Bangkok' },
        { id: 2, name: 'Pizza Roma', category: '🍕 Pizza', rating: 4.8, address: '55 Silom, Bangkok' },
        { id: 3, name: 'Sushi Zen', category: '🍣 Sushi', rating: 4.6, address: '9 Rama 4, Bangkok' },
    ];

    const mockMenus = {
        1: [
            { id: 101, name: 'Cheeseburger', price: 99, emoji: '🍔' },
            { id: 102, name: 'Double Beef', price: 139, emoji: '🍔' },
            { id: 103, name: 'Crispy Chicken', price: 109, emoji: '🍗' },
        ],
        2: [
            { id: 201, name: 'Pepperoni Pizza', price: 149, emoji: '🍕' },
            { id: 202, name: 'Margherita', price: 129, emoji: '🍕' },
            { id: 203, name: 'BBQ Chicken Pizza', price: 159, emoji: '🍕' },
        ],
        3: [
            { id: 301, name: 'Salmon Sushi', price: 129, emoji: '🍣' },
            { id: 302, name: 'Tuna Roll', price: 99, emoji: '🍱' },
            { id: 303, name: 'Edamame', price: 59, emoji: '🫘' },
        ],
    };

    // หน้าเมนูของร้านที่เลือก
    if (selectedRestaurant) {
        const menu = mockMenus[selectedRestaurant.id] || [];
        return (
            <div className="space-y-4">
                <div className="bg-[#1a113d] text-white p-5 rounded-2xl">
                    <button
                        onClick={() => setSelectedRestaurant(null)}
                        className="text-yellow-400 text-sm font-bold mb-2 flex items-center gap-1"
                    >
                        ← กลับ
                    </button>
                    <h3 className="text-xl font-bold">{selectedRestaurant.name}</h3>
                    <p className="text-sm text-gray-300">{selectedRestaurant.category} · ⭐ {selectedRestaurant.rating}</p>
                    <p className="text-xs text-gray-400 mt-1">📍 {selectedRestaurant.address}</p>
                </div>
                <h4 className="text-lg font-bold">เมนู</h4>
                <div className="space-y-3">
                    {menu.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white shadow-sm rounded-2xl">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{item.emoji}</span>
                                <div>
                                    <h4 className="font-bold text-[#1a113d]">{item.name}</h4>
                                    <p className="text-sm font-bold text-yellow-600">฿ {item.price}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => addToCart({ ...item, restaurantName: selectedRestaurant.name })}
                                className="w-9 h-9 flex items-center justify-center bg-yellow-400 rounded-full text-[#1a113d] font-bold text-xl hover:bg-yellow-500 transition"
                            >
                                +
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Banner */}
            <div className="flex items-center justify-center h-32 shadow-sm bg-yellow-300 rounded-2xl">
                <h2 className="text-2xl font-bold text-[#1a113d]">Special Offers!</h2>
            </div>

            {/* Category */}
            <div>
                <h3 className="mb-3 text-lg font-bold">Category</h3>
                <div className="grid grid-cols-4 gap-3 text-sm font-bold text-center">
                    <div className="p-3 bg-white shadow-sm rounded-xl">🍔 Burger</div>
                    <div className="p-3 bg-white shadow-sm rounded-xl">🍕 Pizza</div>
                    <div className="p-3 bg-white shadow-sm rounded-xl">🍽️ อื่นๆ</div>
                    <div className="p-3 bg-white shadow-sm rounded-xl">🍣 Sushi</div>
                </div>
            </div>

            {/* รายการร้านอาหาร */}
            <div>
                <h3 className="mb-3 text-lg font-bold">Near Me</h3>
                <div className="space-y-3">
                    {mockRestaurants.map((restaurant) => (
                        <div
                            key={restaurant.id}
                            onClick={() => setSelectedRestaurant(restaurant)}
                            className="flex gap-4 p-4 bg-white shadow-sm rounded-2xl cursor-pointer hover:shadow-md transition"
                        >
                            <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center text-3xl">
                                {restaurant.category.split(' ')[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-[#1a113d]">{restaurant.name}</h4>
                                <p className="text-sm text-gray-500">{restaurant.category}</p>
                                <p className="text-sm text-gray-500">📍 {restaurant.address}</p>
                                <p className="text-sm font-bold text-yellow-500">⭐ {restaurant.rating}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


function CartPage({ cart, addToCart, removeFromCart, setCurrentTab }) {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                <span className="text-5xl">🛒</span>
                <p className="font-bold">Cart is empty</p>
                <button
                    onClick={() => setCurrentTab('home')}
                    className="mt-2 px-6 py-2 bg-yellow-400 text-[#1a113d] font-bold rounded-full hover:bg-yellow-500 transition"
                >
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-[#1a113d]">🛒 Cart</h2>

            <div className="space-y-3">
                {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white shadow-sm rounded-2xl">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.emoji}</span>
                            <div>
                                <h4 className="font-bold text-[#1a113d]">{item.name}</h4>
                                <p className="text-sm text-gray-500">฿ {item.price} x {item.qty}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full font-bold hover:bg-gray-300 transition"
                            >
                                -
                            </button>
                            <span className="font-bold w-5 text-center">{item.qty}</span>
                            <button
                                onClick={() => addToCart?.(item)}
                                className="w-8 h-8 flex items-center justify-center bg-yellow-400 rounded-full font-bold hover:bg-yellow-500 transition"
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-white rounded-2xl shadow-sm space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>฿ {total}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Delivery Fee</span>
                    <span>฿ 30</span>
                </div>
                <div className="flex justify-between font-bold text-[#1a113d] border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>฿ {total + 30}</span>
                </div>
            </div>

            <button className="w-full py-4 font-bold text-white bg-[#1a113d] rounded-2xl hover:bg-[#2d1e5e] transition shadow-md">
                Confirm Order
            </button>
        </div>
    );
}

function RestaurantDashboard() {
    return (
        <div className="space-y-6">
            <div className="p-6 text-white shadow-lg bg-gradient-to-r from-[#1a113d] to-[#2d1e5e] rounded-3xl">
                <p className="text-sm opacity-80">Total Earning</p>
                <h2 className="mt-1 text-4xl font-bold text-yellow-400">฿ 1,200</h2>
                <p className="mt-2 text-sm">10 Food Orders</p>
            </div>

            <div className="flex flex-col items-center p-3 bg-white shadow-sm rounded-xl text-xs font-bold text-center text-[#1a113d] w-full">
                <span className="mb-1 text-2xl">🍔</span> Menu
            </div>

            <div>
                <h3 className="mb-3 text-lg font-bold">New Orders</h3>
                <div className="space-y-3">
                    {[1, 2].map((item) => (
                        <div key={item} className="flex items-center justify-between p-4 bg-white shadow-sm rounded-2xl">
                            <div>
                                <h4 className="font-bold">Order #00{item}</h4>
                                <p className="text-sm text-gray-500">2x Burger, 1x Sandwich</p>
                            </div>
                            <button className="px-4 py-2 text-sm font-bold bg-yellow-400 rounded-full text-[#1a113d]">
                                Accept
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
