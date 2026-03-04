import React from 'react';

export default function MenuManagePage({ user }) {
    const [menu, setMenu] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [editingId, setEditingId] = React.useState(null);

    // Form State
    const [formData, setFormData] = React.useState({ name: '', description: '', price: '', category: 'other' });

    // ดึงเมนูของร้านตัวเอง
    const fetchMenu = React.useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/items/restaurant/${user.id}`);
            const data = await res.json();
            setMenu(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('ดึงข้อมูลเมนูไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    }, [user]);

    React.useEffect(() => { fetchMenu(); }, [fetchMenu]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditClick = (item) => {
        setEditingId(item._id);
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price,
            category: item.category || 'other'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', price: '', category: 'other' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.price) {
            setError('กรุณากรอกชื่อและราคา');
            return;
        }

        try {
            if (editingId) {
                // อัปเดตเมนู
                const res = await fetch(`http://localhost:5000/api/items/update/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (!res.ok) throw new Error('แก้ไขเมนูไม่สำเร็จ');
            } else {
                // เพิ่มเมนูใหม่
                const res = await fetch('http://localhost:5000/api/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, restaurantId: user.id })
                });
                if (!res.ok) throw new Error('เพิ่มเมนูไม่สำเร็จ');
            }
            handleCancelEdit(); // ล้างฟอร์ม
            fetchMenu(); // ดึงข้อมูลใหม่
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบเมนูนี้?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/items/delete/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('ลบเมนูไม่สำเร็จ');
            setMenu(prev => prev.filter(item => item._id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-[#1a113d]">🍔 จัดการเมนู</h2>

            {/* ฟอร์มเพิ่ม/แก้ไข */}
            <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-bold text-[#1a113d]">{editingId ? '✏️ แก้ไขเมนู' : '✨ เพิ่มเมนูใหม่'}</h3>
                {error && <p className="text-sm text-red-500 font-bold">{error}</p>}

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อเมนู <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="เช่น พิซซ่าฮาวายเอี้ยน" required />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">รายละเอียด</label>
                    <input type="text" name="description" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="เช่น แป้งบางกรอบ เครื่องแน่น" />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">ราคา (บาท) <span className="text-red-500">*</span></label>
                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="199" min="0" required />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">หมวดหมู่</label>
                        <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400">
                            <option value="burger">Burger</option>
                            <option value="pizza">Pizza</option>
                            <option value="sushi">Sushi</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 py-3 font-bold text-white bg-[#1a113d] rounded-xl hover:bg-[#2d1e5e] transition shadow-md">
                        {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={handleCancelEdit} className="px-6 py-3 font-bold text-gray-600 bg-gray-200 rounded-xl hover:bg-gray-300 transition">
                            ยกเลิก
                        </button>
                    )}
                </div>
            </form>

            {/* รายการเมนูทั้งหมด */}
            <div className="space-y-3">
                <h3 className="font-bold text-[#1a113d] flex justify-between items-end">
                    <span>รายการเมนูของร้าน</span>
                    <span className="text-sm font-normal text-gray-500">{menu.length} รายการ</span>
                </h3>

                {loading ? (
                    <div className="text-center text-gray-400 py-6">⏳ กำลังโหลด...</div>
                ) : menu.length === 0 ? (
                    <div className="text-center text-gray-400 py-8 bg-white rounded-2xl shadow-sm">
                        <p className="text-3xl mb-2">🍽️</p>
                        <p className="font-bold">ยังไม่มีเมนู</p>
                    </div>
                ) : (
                    menu.map((item) => (
                        <div key={item._id} className="flex items-center justify-between p-4 bg-white shadow-sm rounded-2xl">
                            <div className="flex-1 mr-4">
                                <h4 className="font-bold text-[#1a113d] text-lg">{item.name}</h4>
                                {item.description && <p className="text-sm text-gray-500 leading-tight my-1">{item.description}</p>}
                                <div className="flex items-center gap-3 mt-1 text-sm font-bold">
                                    <span className="text-yellow-600">฿ {item.price}</span>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg capitalize">{item.category}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => handleEditClick(item)} className="px-4 py-2 text-xs font-bold bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition">
                                    ✏️ แก้ไข
                                </button>
                                <button onClick={() => handleDelete(item._id)} className="px-4 py-2 text-xs font-bold bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition">
                                    🗑️ ลบ
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
