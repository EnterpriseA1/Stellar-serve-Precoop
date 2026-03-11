import React from 'react';
import { STATUS_LABEL } from './constants';
import axios from '../../utils/axiosConfig';

export default function RestaurantOrdersPage({ user }) {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const fetchOrders = React.useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await axios.get(`/orders/restaurant/${user.id}`);
            // ไม่แสดง pending เพราะ pending จะแสดงที่หน้า Home (Dashboard) รอรับออเดอร์
            setOrders(Array.isArray(res.data) ? res.data.filter(o => o.status !== 'pending') : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    React.useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await axios.patch(`/orders/${orderId}/status`, { status });
            fetchOrders();
        } catch (err) {
            console.error('อัปเดตสถานะไม่สำเร็จ:', err);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-400">⏳ กำลังโหลด...</div>;

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                <span className="text-5xl">📋</span>
                <p className="font-bold">ยังไม่มีออเดอร์ที่กำลังดำเนินการ</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4 pb-24">
            <h2 className="text-2xl font-bold text-[#1a113d]">📋 ออเดอร์ที่กำลังดำเนินการ</h2>
            {orders.map(order => {
                const s = STATUS_LABEL[order.status] || { text: order.status, color: 'bg-gray-100 text-gray-700' };
                return (
                    <div key={order._id} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-[#1a113d] text-sm">
                                ลูกค้า: {order.customerId?.name || 'ไม่ระบุ'}
                            </p>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.color}`}>{s.text}</span>
                        </div>
                        {order.deliveryAddress && (
                            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">📍 {order.deliveryAddress}</p>
                        )}
                        <div className="text-sm text-gray-500 space-y-1">
                            {order.items.map((item, i) => (
                                <p key={i}>• {item.name} x{item.quantity}</p>
                            ))}
                        </div>
                        <div className="flex justify-between text-sm font-bold text-[#1a113d] border-t pt-3">
                            <span>ราคาสุทธิ</span>
                            <span>฿ {order.totalPrice}</span>
                        </div>

                        {/* ปุ่มเปลี่ยนสถานะ (ส่ง id พร้อม status ใหม่) */}
                        {(() => {
                            switch (order.status) {
                                case 'preparing':
                                    return <button onClick={() => handleUpdateStatus(order._id, 'delivering')} className="w-full py-3 mt-2 font-bold text-white bg-purple-500 rounded-xl shadow-md active:scale-95 transition">🛵 กำลังจัดส่ง</button>;
                                case 'delivering':
                                    return <button onClick={() => handleUpdateStatus(order._id, 'completed')} className="w-full py-3 mt-2 font-bold text-white bg-gray-800 rounded-xl shadow-md active:scale-95 transition">🎉 จัดส่งสำเร็จ</button>;
                                default:
                                    return null; // completed แล้วจะไม่มีปุ่มให้กด
                            }
                        })()}
                    </div>
                );
            })}
        </div>
    );
}
