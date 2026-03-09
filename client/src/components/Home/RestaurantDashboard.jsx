import React from 'react';

export default function RestaurantDashboard() {
    const [isOpen, setIsOpen] = React.useState(null);
    const [toggling, setToggling] = React.useState(false);
    const [toggleError, setToggleError] = React.useState('');
    const [pendingOrders, setPendingOrders] = React.useState([]);
    const [totalEarning, setTotalEarning] = React.useState(0);
    const [loadingOrders, setLoadingOrders] = React.useState(true);
    const [reviews, setReviews] = React.useState([]);
    const [loadingReviews, setLoadingReviews] = React.useState(true);

    const storedUser = JSON.parse(localStorage.getItem('user'));

    const fetchOrders = () => {
        if (!storedUser?.id) return;
        setLoadingOrders(true);
        fetch(`http://localhost:5000/api/orders/restaurant/${storedUser.id}`)
            .then(res => res.json())
            .then(data => {
                const all = Array.isArray(data) ? data : [];
                setPendingOrders(all.filter(o => o.status === 'pending'));
                // คำนวณยอดรวมจากออเดอร์ที่สำเร็จแล้ว
                const earned = all
                    .filter(o => o.status === 'completed')
                    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
                setTotalEarning(earned);
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingOrders(false));
    };

    const handleOrderStatus = async (orderId, status) => {
        try {
            await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchOrders(); // รีโหลดออเดอร์หลังอัปเดต
        } catch (err) {
            console.error('อัปเดตสถานะไม่สำเร็จ:', err);
        }
    };

    // โหลดสถานะจาก API ตรงๆ
    React.useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) return;

        fetch(`http://localhost:5000/api/auth/restaurants/${stored.id}/status`)
            .then(res => res.json())
            .then(data => {
                if (typeof data.isOpen === 'boolean') setIsOpen(data.isOpen);
            })
            .catch(() => {
                const val = stored.isOpen;
                setIsOpen(typeof val === 'boolean' ? val : true);
            });

        fetchOrders();

        // โหลดรีวิวของร้าน
        setLoadingReviews(true);
        fetch(`http://localhost:5000/api/reviews/restaurant/${stored.id}`)
            .then(res => res.json())
            .then(data => {
                setReviews(Array.isArray(data) ? data : []);
            })
            .catch(err => console.error('โหลดรีวิวไม่สำเร็จ:', err))
            .finally(() => setLoadingReviews(false));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleToggle = async () => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) return;
        setToggling(true);
        setToggleError('');
        try {
            const res = await fetch(
                `http://localhost:5000/api/auth/restaurants/${storedUser.id}/toggle`,
                { method: 'PATCH' }
            );
            const data = await res.json();
            if (!res.ok) {
                setToggleError(data.message || 'ไม่สามารถเปลี่ยนสถานะได้');
                return;
            }
            setIsOpen(data.isOpen);
            localStorage.setItem('user', JSON.stringify({ ...storedUser, isOpen: data.isOpen }));
        } catch (err) {
            console.error('toggle ไม่สำเร็จ:', err);
            setToggleError('เชื่อมต่อ Server ไม่ได้ กรุณาลองใหม่');
        } finally {
            setToggling(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* สถานะร้านและปุ่มเปิด/ปิด */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5">
                    <div>
                        <p className="text-sm text-gray-500 font-bold">สถานะร้านของคุณ</p>
                        {isOpen === null ? (
                            <p className="text-lg font-bold mt-1 text-gray-400">⏳ กำลังโหลด...</p>
                        ) : (
                            <p className={`text-lg font-bold mt-1 ${isOpen ? 'text-green-500' : 'text-red-400'}`}>
                                {isOpen ? '🟢 เปิดรับออเดอร์' : '🔴 ปิดร้านชั่วคราว'}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleToggle}
                        disabled={toggling || isOpen === null}
                        className={`relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none
                            ${isOpen ? 'bg-green-400' : 'bg-gray-300'}
                            ${(toggling || isOpen === null) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <span
                            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300
                                ${isOpen ? 'translate-x-8' : 'translate-x-0'}`}
                        />
                    </button>
                </div>
                {toggleError && (
                    <p className="px-5 pb-4 text-sm text-red-500 font-bold">⚠️ {toggleError}</p>
                )}
            </div>

            {/* สรุปรายได้และเรตติ้ง */}
            <div className="grid grid-cols-2 gap-4">
                {/* รายได้ */}
                <div className="p-5 text-white shadow-sm bg-gradient-to-br from-[#1a113d] to-[#2d1e5e] rounded-3xl flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 text-white/10 text-5xl">💰</div>
                    <p className="text-xs opacity-80 mb-1 z-10">รายได้รวม</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 z-10">
                        ฿{totalEarning.toLocaleString('th-TH')}
                    </h2>
                </div>

                {/* เรตติ้งเฉลี่ย */}
                <div className="p-5 bg-white shadow-sm border border-gray-100 rounded-3xl flex flex-col justify-center items-center text-center">
                    <p className="text-xs text-gray-500 font-bold mb-1">คะแนนเฉลี่ยร้านคุณ</p>
                    <div className="flex items-end gap-1">
                        <span className="text-2xl sm:text-3xl font-bold text-[#1a113d]">
                            {reviews.length > 0
                                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                                : '0.0'}
                        </span>
                        <span className="text-sm font-bold text-yellow-500 mb-1">⭐</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{reviews.length} รีวิว</p>
                </div>
            </div>

            <div>
                <h3 className="mb-3 text-lg font-bold">New Orders ({pendingOrders.length})</h3>

                {loadingOrders && <div className="text-center text-gray-400 py-4">⏳ กำลังโหลด...</div>}

                {!loadingOrders && pendingOrders.length === 0 && (
                    <div className="text-center text-gray-400 py-6 bg-white rounded-2xl">
                        <p className="text-3xl mb-2">🎉</p>
                        <p className="font-bold">ไม่มีออเดอร์รอรับ</p>
                    </div>
                )}

                <div className="space-y-3">
                    {pendingOrders.map((order) => (
                        <div key={order._id} className="p-4 bg-white shadow-sm rounded-2xl space-y-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold">👤 {order.customerId?.name || 'ลูกค้า'}</h4>
                                    <p className="text-xs text-gray-400">📞 {order.customerId?.phone || '-'}</p>
                                </div>
                                <span className="text-sm font-bold text-yellow-600">฿ {order.totalPrice}</span>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                                {order.items.map((item, i) => (
                                    <p key={i}>• {item.name} x{item.quantity}</p>
                                ))}
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={() => handleOrderStatus(order._id, 'preparing')}
                                    className="flex-1 py-2 text-sm font-bold bg-yellow-400 rounded-full text-[#1a113d] hover:bg-yellow-500 transition"
                                >
                                    ✅ Accept
                                </button>
                                <button
                                    onClick={() => handleOrderStatus(order._id, 'cancelled')}
                                    className="flex-1 py-2 text-sm font-bold bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 transition"
                                >
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ส่วนรีวิวที่ลูกค้าเข้ามาให้ */}
            <div className="pt-4 border-t">
                <h3 className="mb-3 text-lg font-bold flex items-center justify-between">
                    <span>รีวิวล่าสุด</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{reviews.length} รีวิว</span>
                </h3>

                {loadingReviews && <div className="text-center text-gray-400 py-4">⏳ กำลังโหลด...</div>}

                {!loadingReviews && reviews.length === 0 && (
                    <div className="text-center text-gray-400 py-6 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                        <span className="text-3xl">📝</span>
                        <p className="font-bold text-sm mt-2">ยังไม่มีรีวิวจากลูกค้า</p>
                    </div>
                )}

                <div className="space-y-3">
                    {reviews.map((review) => (
                        <div key={review._id} className="p-4 bg-white shadow-sm border border-gray-50 rounded-2xl flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-400 font-bold overflow-hidden border">
                                {review.customerId?.imageUrl ? (
                                    <img src={review.customerId.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    review.customerId?.name?.charAt(0).toUpperCase() || '👤'
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-bold text-sm text-[#1a113d]">
                                            {review.customerId?.name || 'ลูกค้า'}
                                        </p>
                                        <p className="text-[10px] text-gray-400">
                                            {new Date(review.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="flex text-yellow-400 text-xs">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <span key={i} className={i < review.rating ? 'opacity-100' : 'opacity-30'}>★</span>
                                        ))}
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="text-sm mt-2 text-gray-600 bg-gray-50 p-2.5 rounded-xl">{review.comment}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
