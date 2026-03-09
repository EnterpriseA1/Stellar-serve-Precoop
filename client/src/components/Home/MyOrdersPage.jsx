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

function ReviewModal({ order, onClose, onSubmit }) {
    const [rating, setRating] = React.useState(5);
    const [comment, setComment] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order._id,
                    customerId: order.customerId?._id || order.customerId,
                    restaurantId: order.restaurantId?._id || order.restaurantId,
                    rating,
                    comment
                })
            });
            if (res.ok) {
                onSubmit(order._id);
            } else {
                const data = await res.json();
                alert(data.message || 'ส่งรีวิวไม่สำเร็จ');
            }
        } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl">
                <h3 className="text-xl font-bold text-[#1a113d] mb-4 text-center">รีวิว {order.restaurantId?.name || 'ร้านอาหาร'}</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <p className="text-sm font-bold text-gray-700 mb-3 text-center">ให้คะแนนร้านอาหาร</p>
                        <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-4xl transition-transform ${star <= rating ? 'text-yellow-400' : 'text-gray-200 hover:scale-110'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">ความคิดเห็น (ตัวเลือก)</label>
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-transparent focus:bg-white border focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 resize-none text-sm transition-all"
                            rows="3"
                            placeholder="อาหารอร่อยมาก, จัดส่งรวดเร็ว..."
                        ></textarea>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-2xl bg-yellow-400 text-[#1a113d] font-bold hover:bg-yellow-500 transition shadow-lg shadow-yellow-400/30 disabled:opacity-50"
                        >
                            {loading ? 'กำลังส่ง...' : 'ส่งรีวิวเลย'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function MyOrdersPage({ user }) {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [reviewingOrder, setReviewingOrder] = React.useState(null);

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

    const handleReviewSubmit = (orderId) => {
        setOrders(orders.map(o => o._id === orderId ? { ...o, isReviewed: true } : o));
        setReviewingOrder(null);
    };

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

                    {/* ปุ่มรีวิว */}
                    {order.status === 'completed' && !order.isReviewed && (
                        <div className="pt-3 border-t">
                            <button
                                onClick={() => setReviewingOrder(order)}
                                className="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-100 transition flex items-center justify-center gap-2"
                            >
                                ⭐ ให้คะแนนและรีวิว
                            </button>
                        </div>
                    )}

                    {order.status === 'completed' && order.isReviewed && (
                        <div className="pt-3 border-t">
                            <p className="text-center text-sm font-bold text-green-500">⭐ ขอบคุณสำหรับรีวิว</p>
                        </div>
                    )}
                </div>
            ))}

            {/* Modal รีวิว */}
            {reviewingOrder && (
                <ReviewModal
                    order={reviewingOrder}
                    onClose={() => setReviewingOrder(null)}
                    onSubmit={handleReviewSubmit}
                />
            )}
        </div>
    );
}
