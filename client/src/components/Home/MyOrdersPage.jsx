import React from 'react';

// ขั้นตอนสถานะออเดอร์ตามลำดับ
const STEPS = [
    { key: 'pending', icon: '🕐', label: 'รอยืนยัน' },
    { key: 'preparing', icon: '👨‍🍳', label: 'กำลังทำ' },
    { key: 'delivering', icon: '🛵', label: 'กำลังส่ง' },
    { key: 'completed', icon: '✅', label: 'สำเร็จ' },
];

function OrderTimeline({ status }) {
    if (status === 'cancelled') {
        return (
            <div className="flex items-center gap-2 py-2">
                <span className="text-xl">❌</span>
                <span className="text-sm font-bold text-red-500">ออเดอร์ถูกยกเลิก</span>
            </div>
        );
    }

    const currentIdx = STEPS.findIndex(s => s.key === status);

    return (
        <div className="flex items-center gap-0 py-3">
            {STEPS.map((step, idx) => {
                const done = idx < currentIdx;
                const active = idx === currentIdx;
                const pending = idx > currentIdx;

                return (
                    <React.Fragment key={step.key}>
                        {/* Step circle */}
                        <div className="flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-bold transition
                                ${done ? 'bg-green-400 text-white' : ''}
                                ${active ? 'bg-[#1a113d] text-white ring-4 ring-yellow-300' : ''}
                                ${pending ? 'bg-gray-100 text-gray-400' : ''}`}
                            >
                                {done ? '✓' : step.icon}
                            </div>
                            <p className={`text-[10px] mt-1 font-bold text-center leading-tight
                                ${done ? 'text-green-500' : ''}
                                ${active ? 'text-[#1a113d]' : ''}
                                ${pending ? 'text-gray-400' : ''}`}
                            >
                                {step.label}
                            </p>
                        </div>

                        {/* Connector line ระหว่างขั้นตอน */}
                        {idx < STEPS.length - 1 && (
                            <div className={`flex-1 h-1 mb-5 rounded-full transition
                                ${idx < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

export default function MyOrdersPage({ user }) {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!user?.id) return;
        fetch(`http://localhost:5000/api/orders/customer/${user.id}`)
            .then(res => res.json())
            .then(data => setOrders(Array.isArray(data) ? data : []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) return <div className="p-10 text-center text-gray-400">⏳ กำลังโหลด...</div>;

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                <span className="text-5xl">📋</span>
                <p className="font-bold">ยังไม่มีออเดอร์</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-[#1a113d]">📋 My Orders</h2>
            {orders.map(order => (
                <div key={order._id} className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
                    {/* Header: ร้าน + วันที่ */}
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-bold text-[#1a113d]">
                                {order.restaurantId?.name || 'ร้านอาหาร'}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(order.createdAt).toLocaleString('th-TH')}
                            </p>
                        </div>
                        <span className="text-sm font-bold text-yellow-600">฿ {order.totalPrice}</span>
                    </div>

                    {/* Timeline */}
                    <OrderTimeline status={order.status} />

                    {/* รายการอาหาร */}
                    <div className="text-sm text-gray-500 space-y-1 border-t pt-2">
                        {order.items.map((item, i) => (
                            <p key={i}>• {item.name} x{item.quantity} — ฿{item.price * item.quantity}</p>
                        ))}
                    </div>

                    {/* ที่อยู่จัดส่ง */}
                    {order.deliveryAddress && (
                        <p className="text-xs text-gray-400">📍 {order.deliveryAddress}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
