import React from 'react';

export default function CustomerDashboard({ addToCart }) {
    const [selectedRestaurant, setSelectedRestaurant] = React.useState(null);
    const [restaurants, setRestaurants] = React.useState([]);
    const [menu, setMenu] = React.useState([]);
    const [loadingRestaurants, setLoadingRestaurants] = React.useState(true);
    const [loadingMenu, setLoadingMenu] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');

    // ดึงรายชื่อร้านอาหารจาก API
    React.useEffect(() => {
        setLoadingRestaurants(true);
        fetch('http://localhost:5000/api/auth/restaurants')
            .then(res => res.json())
            .then(data => setRestaurants(data))
            .catch(err => console.error(err))
            .finally(() => setLoadingRestaurants(false));
    }, []);

    // ดึงเมนูของร้านที่เลือก
    const handleSelectRestaurant = async (restaurant) => {
        setLoadingMenu(true);
        setSelectedRestaurant(restaurant);
        try {
            const res = await fetch(`http://localhost:5000/api/items/restaurant/${restaurant._id}`);
            const data = await res.json();
            setMenu(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('ดึงเมนูไม่สำเร็จ', err);
        } finally {
            setLoadingMenu(false);
        }
    };

    // หน้าเมนูของร้านที่เลือก
    if (selectedRestaurant) {
        return (
            <div className="space-y-4">
                {/* ปุ่มย้อนกลับ & ชื่อร้าน */}
                <div className="p-4 bg-white shadow-sm rounded-2xl">
                    <button
                        onClick={() => { setSelectedRestaurant(null); setMenu([]); }}
                        className="inline-flex items-center gap-2 px-4 py-2 mb-3 bg-gray-100 hover:bg-gray-200 text-[#1a113d] font-bold text-sm rounded-full transition active:scale-95"
                    >
                        ← กลับ
                    </button>
                    <h3 className="text-xl font-bold text-[#1a113d]">{selectedRestaurant.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">📍 {selectedRestaurant.address || 'ไม่ระบุที่อยู่'}</p>
                    <p className="text-xs text-gray-500">📞 {selectedRestaurant.phone}</p>
                </div>
                <h4 className="text-lg font-bold text-[#1a113d]">เมนู</h4>

                {loadingMenu && (
                    <div className="text-center text-gray-400 py-8">⏳ กำลังโหลดเมนู...</div>
                )}

                {!loadingMenu && menu.length === 0 && (
                    <div className="text-center text-gray-400 py-8 bg-white rounded-2xl">
                        <p className="text-3xl mb-2">🍽️</p>
                        <p className="font-bold">ร้านนี้ยังไม่มีเมนู</p>
                    </div>
                )}

                <div className="space-y-3">
                    {menu.map((item) => (
                        <div key={item._id} className="flex items-center justify-between p-4 bg-white shadow-sm rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-yellow-50 flex-shrink-0 flex items-center justify-center">
                                    {item.imageUrl
                                        ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        : <span className="text-3xl">🍽️</span>
                                    }
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#1a113d]">{item.name}</h4>
                                    {item.description && (
                                        <p className="text-xs text-gray-400">{item.description}</p>
                                    )}
                                    <p className="text-sm font-bold text-yellow-600">฿ {item.price}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => addToCart({ ...item, id: item._id, restaurantId: selectedRestaurant._id, restaurantName: selectedRestaurant.name })}
                                className="w-9 h-9 flex items-center justify-center bg-yellow-400 rounded-full text-[#1a113d] font-bold text-xl hover:bg-yellow-500 transition"
                            >
                                +
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const categories = [
        { id: 'burger', icon: '🍔', label: 'Burger' },
        { id: 'pizza', icon: '🍕', label: 'Pizza' },
        { id: 'sushi', icon: '🍣', label: 'Sushi' },
        { id: 'other', icon: '🍽️', label: 'อื่นๆ' },
    ];

    const filteredRestaurants = restaurants.filter(r => {
        const matchesCategory = !selectedCategory || r.category === selectedCategory || (!r.category && selectedCategory === 'other');
        const matchesSearch = !searchQuery.trim() || r.name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.address?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Banner */}
            <div className="flex items-center justify-center h-32 shadow-sm bg-yellow-300 rounded-2xl">
                <h2 className="text-2xl font-bold text-[#1a113d]">Special Offers!</h2>
            </div>

            {/* Category */}
            <div>
                <h3 className="mb-3 text-lg font-bold">Category</h3>
                <div className="grid grid-cols-4 gap-3 text-sm font-bold text-center">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                            className={`p-3 shadow-sm rounded-xl cursor-pointer transition-colors ${selectedCategory === cat.id ? 'bg-[#1a113d] text-white' : 'bg-white hover:bg-gray-50'}`}
                        >
                            <div className="text-xl mb-1">{cat.icon}</div>
                            <div className="truncate">{cat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* รายการร้านอาหาร */}
            <div>
                {/* Search Bar */}
                <div className="relative mb-3">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ค้นหาร้านอาหาร..."
                        className="w-full px-5 py-2.5 pl-10 bg-white shadow-sm border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                    />
                    <span className="absolute top-2.5 left-3.5 text-gray-400">🔍</span>
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute top-2 right-3 text-gray-400 hover:text-gray-600">✕</button>
                    )}
                </div>
                <h3 className="mb-3 text-lg font-bold">
                    {searchQuery ? `ผลลัพธ์สำหรับ "${searchQuery}"` : selectedCategory ? `ร้านอาหารหมวดหมู่ ${categories.find(c => c.id === selectedCategory)?.label}` : 'ร้านอาหารทั้งหมด'}
                </h3>

                {loadingRestaurants && (
                    <div className="text-center text-gray-400 py-8">⏳ กำลังโหลด...</div>
                )}

                {!loadingRestaurants && filteredRestaurants.length === 0 && (
                    <div className="text-center text-gray-400 py-8 bg-white rounded-2xl">
                        <p className="text-3xl mb-2">🏪</p>
                        <p className="font-bold">ยังไม่มีร้านอาหารในหมวดหมู่นี้</p>
                    </div>
                )}

                <div className="space-y-3">
                    {filteredRestaurants.map((restaurant) => (
                        <div
                            key={restaurant._id}
                            onClick={() => handleSelectRestaurant(restaurant)}
                            className="flex gap-4 p-4 bg-white shadow-sm rounded-2xl cursor-pointer hover:shadow-md transition"
                        >
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-yellow-100 flex-shrink-0 flex items-center justify-center">
                                {restaurant.imageUrl
                                    ? <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
                                    : <span className="text-3xl">🏪</span>
                                }
                            </div>
                            <div>
                                <h4 className="font-bold text-[#1a113d]">{restaurant.name}</h4>
                                {restaurant.address && (
                                    <p className="text-sm text-gray-500">📍 {restaurant.address}</p>
                                )}
                                <p className="text-sm text-gray-500">📞 {restaurant.phone}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
