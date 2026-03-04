import React from 'react';
import { STATUS_LABEL } from './constants';

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
            {orders.map(order => {
                const s = STATUS_LABEL[order.status] || { text: order.status, color: 'bg-gray-100 text-gray-700' };
                return (
                    <div key={order._id} className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-[#1a113d] text-sm">
                                {order.restaurantId?.name || 'ร้านอาหาร'}
                            </p>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.color}`}>{s.text}</span>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                            {order.items.map((item, i) => (
                                <p key={i}>• {item.name} x{item.quantity} — ฿{item.price * item.quantity}</p>
                            ))}
                        </div>
                        <div className="flex justify-between text-sm font-bold text-[#1a113d] border-t pt-2">
                            <span>Total</span>
                            <span>฿ {order.totalPrice}</span>
                        </div>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('th-TH')}</p>
                    </div>
                );
            })}
        </div>
    );
}
