import React from 'react';

export default function RestaurantDashboard() {
    const [isOpen, setIsOpen] = React.useState(null);
    const [toggling, setToggling] = React.useState(false);
    const [toggleError, setToggleError] = React.useState('');
    const [pendingOrders, setPendingOrders] = React.useState([]);
    const [totalEarning, setTotalEarning] = React.useState(0);
    const [loadingOrders, setLoadingOrders] = React.useState(true);

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

            {/* รายได้ */}
            <div className="p-6 text-white shadow-lg bg-gradient-to-r from-[#1a113d] to-[#2d1e5e] rounded-3xl">
                <p className="text-sm opacity-80">Total Earning</p>
                <h2 className="mt-1 text-4xl font-bold text-yellow-400">
                    ฿ {totalEarning.toLocaleString('th-TH')}
                </h2>
                <p className="mt-2 text-sm">มีออเดอร์รอรับ {pendingOrders.length} รายการ</p>
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
        </div>
    );
}
