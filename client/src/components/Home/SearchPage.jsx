import React from 'react';
import axios from '../../utils/axiosConfig';

export default function SearchPage({ onSelectRestaurant }) {
    const [query, setQuery] = React.useState('');
    const [restaurants, setRestaurants] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [searched, setSearched] = React.useState(false);

    React.useEffect(() => {
        axios.get('/auth/restaurants')
            .then(res => setRestaurants(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error(err));
    }, []);

    const filtered = query.trim()
        ? restaurants.filter(r =>
            r.name?.toLowerCase().includes(query.toLowerCase()) ||
            r.address?.toLowerCase().includes(query.toLowerCase())
        )
        : [];

    return (
        <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-[#1a113d]">🔍 ค้นหาร้านอาหาร</h2>

            {/* Search Input */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSearched(true); }}
                    placeholder="พิมพ์ชื่อร้านหรือที่อยู่..."
                    className="w-full px-5 py-3 pl-11 bg-white shadow-sm border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                />
                <span className="absolute top-3 left-4 text-gray-400 text-lg">🔍</span>
                {query && (
                    <button
                        onClick={() => { setQuery(''); setSearched(false); }}
                        className="absolute top-2.5 right-4 text-gray-400 hover:text-gray-600 text-lg"
                    >✕</button>
                )}
            </div>

            {/* Empty state ก่อนพิมพ์ */}
            {!searched && (
                <div className="mt-8 text-center text-gray-400 space-y-2">
                    <p className="text-4xl">🏪</p>
                    <p className="font-bold">พิมพ์ชื่อร้านเพื่อเริ่มค้นหา</p>
                </div>
            )}

            {/* ไม่พบผลลัพธ์ */}
            {searched && query.trim() && filtered.length === 0 && (
                <div className="mt-8 text-center text-gray-400 space-y-2">
                    <p className="text-4xl">😔</p>
                    <p className="font-bold">ไม่พบร้านอาหาร "<span className="text-[#1a113d]">{query}</span>"</p>
                    <p className="text-sm">ลองค้นหาด้วยคำอื่น</p>
                </div>
            )}

            {/* ผลลัพธ์ */}
            {filtered.length > 0 && (
                <div className="space-y-3">
                    <p className="text-sm text-gray-500">พบ {filtered.length} ร้าน</p>
                    {filtered.map((restaurant) => (
                        <div
                            key={restaurant._id}
                            onClick={() => onSelectRestaurant?.(restaurant)}
                            className="flex gap-4 p-4 bg-white shadow-sm rounded-2xl cursor-pointer hover:shadow-md transition"
                        >
                            <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                🏪
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[#1a113d] truncate">{restaurant.name}</h4>
                                {restaurant.address && (
                                    <p className="text-sm text-gray-500 truncate">📍 {restaurant.address}</p>
                                )}
                                <p className="text-sm text-gray-500">📞 {restaurant.phone}</p>
                                {restaurant.category && (
                                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full capitalize font-bold">
                                        {restaurant.category}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
