import React from 'react';
import { useNavigate } from 'react-router-dom';
import ImagePicker from './ImagePicker';
import axios from '../../utils/axiosConfig';

export default function ProfilePage({ user, setUser }) {
    const navigate = useNavigate();
    const [showSettings, setShowSettings] = React.useState(false);
    const [showHelp, setShowHelp] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        imageUrl: user?.imageUrl || null,
    });
    const [saving, setSaving] = React.useState(false);
    const [saveMsg, setSaveMsg] = React.useState('');
    const [saveError, setSaveError] = React.useState('');

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/');
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        // ถ้าช่องไหนว่างให้ใช้ค่าเดิมแทน
        const payload = {
            name: formData.name.trim() || user.name,
            phone: formData.phone.trim() || user.phone,
            address: formData.address.trim() || user.address || '',
            imageUrl: formData.imageUrl ?? user.imageUrl ?? null,
        };

        setSaving(true);
        setSaveMsg('');
        setSaveError('');
        try {
            await axios.patch(`/auth/profile/${user.id}`, payload);
            
            // อัปเดต localStorage และ state ให้ตรงกับข้อมูลใหม่
            const updatedUser = { ...user, ...payload };
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            if (setUser) setUser(updatedUser);
            // อัปเดต formData ให้แสดงค่าล่าสุด
            setFormData(payload);
            setSaveMsg('✅ บันทึกสำเร็จแล้ว!');
            setTimeout(() => setSaveMsg(''), 3000);
        } catch (err) {
            setSaveError(err.response?.data?.message || 'เชื่อมต่อ Server ไม่ได้');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-[#1a113d]">My Profile</h2>

            {/* Avatar + ชื่อ */}
            <div className="p-6 text-center bg-white rounded-3xl shadow-sm">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-yellow-300 shadow flex items-center justify-center bg-gray-100">
                    {formData.imageUrl
                        ? <img src={formData.imageUrl} alt="profile" className="w-full h-full object-cover" />
                        : <span className="text-4xl">👤</span>
                    }
                </div>
                <h3 className="text-xl font-bold text-[#1a113d]">{user.name}</h3>
                <p className="text-gray-400 text-sm">@{user.username}</p>
                <span className="inline-block mt-2 px-3 py-1 text-xs font-bold text-yellow-600 bg-yellow-100 rounded-full uppercase">
                    {user.role}
                </span>
            </div>

            {/* Account Settings (Toggle) */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full p-4 text-left font-bold flex justify-between items-center hover:bg-gray-50 transition"
                >
                    <span>⚙️ Account Settings</span>
                    <span className="text-gray-400 transition-transform duration-200" style={{ transform: showSettings ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</span>
                </button>

                {showSettings && (
                    <div className="px-4 pb-4 space-y-3 border-t pt-3">

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">ชื่อ-นามสกุล</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                                placeholder="ชื่อ-นามสกุล"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">เบอร์โทร</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                                placeholder="0xx-xxx-xxxx"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">ที่อยู่</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows="2"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                                placeholder="บ้านเลขที่ ซอย ถนน..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">{user.role === 'restaurant' ? 'รูปร้านอาหาร' : 'รูปโปรไฟล์'}</label>
                            <ImagePicker
                                value={formData.imageUrl}
                                onChange={(val) => setFormData(prev => ({ ...prev, imageUrl: val }))}
                                placeholder={user.role === 'restaurant' ? '🏪' : '👤'}
                                label="คลิกเพื่ออัปโหลดรูป"
                                shape="rect"
                            />
                        </div>

                        {saveError && <p className="text-xs text-red-500 font-bold">⚠️ {saveError}</p>}
                        {saveMsg && <p className="text-xs text-green-600 font-bold">{saveMsg}</p>}

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`w-full py-2.5 font-bold text-white rounded-xl transition text-sm ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1a113d] hover:bg-[#2d1e5e]'}`}
                        >
                            {saving ? '⏳ กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                        </button>
                    </div>
                )}
            </div>

            {/* Help Center */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="w-full p-4 text-left font-bold flex justify-between items-center hover:bg-gray-50 transition"
                >
                    <span>🆘 Help Center</span>
                    <span className="text-gray-400 transition-transform duration-200" style={{ transform: showHelp ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</span>
                </button>

                {showHelp && (
                    <div className="px-5 pb-5 border-t pt-3 space-y-1">
                        <p className="text-sm text-red-500 font-bold">⚠️ หากพบปัญหาการใช้งาน กรุณาติดต่อทีมงานผ่านทาง Email:</p>
                        <p className="text-sm text-red-500 font-bold">📧 support@stellarserve.com</p>
                        <p className="text-xs text-gray-400">เราจะตอบกลับภายใน 1-2 วันทำการ</p>
                    </div>
                )}
            </div>

            <button
                onClick={handleLogout}
                className="w-full p-4 font-bold text-center text-white bg-red-500 rounded-full shadow hover:bg-red-600 transition active:scale-95"
            >
                Logout
            </button>
        </div>
    );
}
