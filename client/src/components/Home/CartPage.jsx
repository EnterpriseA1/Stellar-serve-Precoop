import React from 'react';

export default function CartPage({ cart, addToCart, removeFromCart, setCurrentTab, clearCart, user }) {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const [ordering, setOrdering] = React.useState(false);
    const [orderError, setOrderError] = React.useState('');
    const [step, setStep] = React.useState('cart'); // 'cart' หรือ 'address'
    const [address, setAddress] = React.useState(user?.address || '');

    // รวมกลุ่มร้านค้า (อาจมีหลายร้านในตะกร้า)
    const restaurantId = cart[0]?._id ? null : cart[0]?.restaurantId;

    const handleProceed = () => {
        setStep('address');
    };

    const handleConfirmOrder = async () => {
        if (!user) return;
        if (!address.trim()) {
            setOrderError('กรุณากรอกที่อยู่สำหรับจัดส่ง');
            return;
        }

        // ดึง restaurantId จาก item แรกใน cart
        const firstItem = cart[0];
        const rId = firstItem?.restaurantId || null;
        if (!rId) {
            setOrderError('ไม่พบข้อมูลร้านอาหาร กรุณาเพิ่มสินค้าใหม่');
            return;
        }
        setOrdering(true);
        setOrderError('');
        try {
            const res = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: user.id,
                    restaurantId: rId,
                    items: cart.map(item => ({
                        itemId: item._id || item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.qty
                    })),
                    totalPrice: total + 30,
                    deliveryAddress: address
                })
            });
            const data = await res.json();
            if (!res.ok) {
                setOrderError(data.message || 'สั่งออเดอร์ไม่สำเร็จ');
                return;
            }
            clearCart();
            setCurrentTab('orders');
        } catch (err) {
            setOrderError('เชื่อมต่อ Server ไม่ได้ กรุณาลองใหม่');
        } finally {
            setOrdering(false);
        }
    };

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

    if (step === 'address') {
        return (
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => setStep('cart')} className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1a113d] font-bold text-sm rounded-full transition active:scale-95">
                        ← กลับ
                    </button>
                    <h2 className="text-2xl font-bold text-[#1a113d]">Delivery Details</h2>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
                    <label className="block text-sm font-bold text-gray-700">ที่อยู่จัดส่งของคุณ</label>
                    <textarea
                        className="w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        rows="3"
                        placeholder="กรอกที่อยู่จัดส่งแบบละเอียด (เช่น บ้านเลขที่ ซอย จุดสังเกต)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    ></textarea>
                </div>

                {orderError && <p className="text-sm text-red-500 font-bold text-center">⚠️ {orderError}</p>}

                {/* คำเตือนเรื่องการชำระเงิน */}
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl text-xs text-yellow-800 text-center font-medium">
                    ⚠️ <span className="font-bold text-red-600">โปรดทราบ:</span> ชำระเงินด้วย <span className="font-bold underline">เงินสด</span> กับไรเดอร์ของร้านค้าเท่านั้น ณ วันจัดส่ง
                </div>

                <button
                    onClick={handleConfirmOrder}
                    disabled={ordering}
                    className={`w-full py-4 font-bold text-white rounded-2xl shadow-md transition
                        ${ordering ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1a113d] hover:bg-[#2d1e5e]'}`}
                >
                    {ordering ? '⏳ กำลังสั่ง...' : 'Confirm Order'}
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
                            <span className="text-2xl">🍽️</span>
                            <div>
                                <h4 className="font-bold text-[#1a113d]">{item.name}</h4>
                                <p className="text-sm text-gray-500">฿ {item.price} x {item.qty}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full font-bold hover:bg-gray-300 transition">-</button>
                            <span className="font-bold w-5 text-center">{item.qty}</span>
                            <button onClick={() => addToCart?.(item)}
                                className="w-8 h-8 flex items-center justify-center bg-yellow-400 rounded-full font-bold hover:bg-yellow-500 transition">+</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-sm space-y-2">
                <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>฿ {total}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>Delivery Fee</span><span>฿ 30</span></div>
                <div className="flex justify-between font-bold text-[#1a113d] border-t pt-2 mt-2"><span>Total</span><span>฿ {total + 30}</span></div>
            </div>

            <button
                onClick={handleProceed}
                className="w-full py-4 font-bold text-white rounded-2xl shadow-md transition bg-[#1a113d] hover:bg-[#2d1e5e]"
            >
                Proceed to Checkout
            </button>
        </div>
    );
}
