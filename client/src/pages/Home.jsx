import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import Navbar from '../components/Navbar';
import NavbarRestaurant from '../components/NavbarRestaurant';

// นำเข้า Component ลูกต่างๆที่ถูกแยกไฟล์ออกไปเพื่อความเป็นระเบียบ
import CustomerDashboard from '../components/Home/CustomerDashboard';
import RestaurantDashboard from '../components/Home/RestaurantDashboard';
import CartPage from '../components/Home/CartPage';
import SearchPage from '../components/Home/SearchPage';
import MyOrdersPage from '../components/Home/MyOrdersPage';
import RestaurantOrdersPage from '../components/Home/RestaurantOrdersPage';
import MenuManagePage from '../components/Home/MenuManagePage';
import ProfilePage from '../components/Home/ProfilePage';

export default function Home() {
    const [user, setUser] = useState(null);
    const [currentTab, setCurrentTab] = useState('home');
    const [cart, setCart] = useState([]); // cart state
    const [pendingItem, setPendingItem] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const navigate = useNavigate();

    // ช่วยอัปเดต Cart ไปที่ Backend ทุกครั้งที่มีการเปลี่ยนแปลง
    const syncCartToDB = async (newCartItems, rId) => {
        if (!user) return;
        try {
            await axios.post('/cart/sync', {
                customerId: user.id,
                restaurantId: rId,
                items: newCartItems
            });
        } catch (error) {
            console.error('Failed to sync cart:', error);
        }
    };

    // เพิ่มสินค้าลงตะกร้า
    const addToCart = (item) => {
        // เช็คว่ามีสินค้าในตะกร้ากี่ชิ้น และมาจากคนละร้านหรือไม่ (เช็คจาก state cart โดยตรง)
        if (cart.length > 0 && cart[0].restaurantId !== item.restaurantId) {
            setPendingItem(item);
            setShowConfirmModal(true);
            return; // ยังไม่เพิ่มสินค้าลงในตะกร้า จนกว่าจะยืนยัน
        }

        const existing = cart.find(c => c.id === item.id);
        let newCart;
        if (existing) {
            newCart = cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
        } else {
            newCart = [...cart, { ...item, qty: 1 }];
        }
        
        setCart(newCart);
        syncCartToDB(newCart, item.restaurantId);
    };

    const handleConfirmClearCart = () => {
        if (pendingItem) {
            const newCart = [{ ...pendingItem, qty: 1 }];
            setCart(newCart);
            syncCartToDB(newCart, pendingItem.restaurantId);
        }
        setShowConfirmModal(false);
        setPendingItem(null);
    };

    const handleCancelClearCart = () => {
        setShowConfirmModal(false);
        setPendingItem(null);
    };

    // ลดจำนวนหรือลบออกจากตะกร้า
    const removeFromCart = (itemId) => {
        const existing = cart.find(c => c.id === itemId);
        if (!existing) return;
        
        let newCart;
        if (existing.qty === 1) {
            newCart = cart.filter(c => c.id !== itemId);
        } else {
            newCart = cart.map(c => c.id === itemId ? { ...c, qty: c.qty - 1 } : c);
        }
        
        setCart(newCart);
        // ถ้าลบจนหมดตะกร้า restaurantId จะเป็น null
        syncCartToDB(newCart, newCart.length > 0 ? newCart[0].restaurantId : null);
    };

    const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

    useEffect(() => {
        // เช็คว่ามีข้อมูล User ในเครื่องไหม (ล็อกอินหรือยัง)
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser) {
            navigate('/'); // ถ้ายังไม่ล็อกอิน ให้เด้งกลับไปหน้า Sign In
        } else {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            // โหลดข้อมูลตะกร้าของ User จาก Database เฉพาะตอนโหลดหน้าครั้งแรก
            axios.get(`/cart/${parsedUser.id}`)
                .then(res => {
                    if (res.data && res.data.items) {
                        setCart(res.data.items);
                    }
                })
                .catch(err => console.error('Failed to load cart from DB:', err));
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

                {currentTab === 'cart' && <CartPage cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} setCurrentTab={setCurrentTab} clearCart={() => { setCart([]); syncCartToDB([], null); }} user={user} />}

                {currentTab === 'search' && <SearchPage onSelectRestaurant={(restaurant) => { setCurrentTab('home'); }} />}
                {currentTab === 'orders' && (
                    user.role === 'restaurant' ? <RestaurantOrdersPage user={user} /> : <MyOrdersPage user={user} />
                )}
                {currentTab === 'menu' && <MenuManagePage user={user} />}
                {currentTab === 'profile' && <ProfilePage user={user} setUser={setUser} />}
            </div>

            {/* Navbar แยกตาม role */}
            {user.role === 'restaurant'
                ? <NavbarRestaurant currentTab={currentTab} setCurrentTab={setCurrentTab} />
                : <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} cartCount={cartCount} />
            }

            {/* Modal ยืนยันเคลียร์ตะกร้า */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center text-3xl mb-4">
                            ⚠️
                        </div>
                        <h3 className="text-xl font-bold text-[#1a113d] mb-2">สั่งอาหารข้ามร้าน?</h3>
                        <p className="text-gray-600 mb-6 text-sm">
                            คุณมีรายการอาหารจากร้านอื่นในตะกร้า ต้องการล้างตะกร้าเพื่อเริ่มต้นสั่งจากร้าน <span className="font-bold text-[#1a113d]">"{pendingItem?.restaurantName}"</span> แทนหรือไม่?
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={handleCancelClearCart}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition cursor-pointer"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleConfirmClearCart}
                                className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-[#1a113d] font-bold rounded-xl transition shadow-[0_4px_0_0_#d9b800] hover:shadow-[0_2px_0_0_#d9b800] hover:translate-y-[2px] cursor-pointer"
                            >
                                ล้างตะกร้า
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
