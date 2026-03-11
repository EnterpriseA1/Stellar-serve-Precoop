import React from 'react';
import axios from '../../utils/axiosConfig';

function ReviewListModal({ restaurant, onClose }) {
    const [reviews, setReviews] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        axios.get(`/reviews/restaurant/${restaurant._id}`)
            .then(res => setReviews(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [restaurant]);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="text-lg font-bold text-[#1a113d]">รีวิวของร้าน</h3>
                        <p className="text-xs text-gray-500">{restaurant.name}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition font-bold text-gray-500">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="text-center text-gray-400 py-10">⏳ กำลังโหลดรีวิว...</div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center text-gray-400 py-10 flex flex-col items-center gap-2">
                            <span className="text-4xl">💭</span>
                            <p className="font-bold">ยังไม่มีรีวิวสำหรับร้านนี้</p>
                        </div>
                    ) : (
                        reviews.map(review => (
                            <div key={review._id} className="bg-gray-50 p-4 rounded-2xl flex gap-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden text-lg font-bold text-indigo-500">
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
                                                {new Date(review.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex text-yellow-400 text-sm">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i} className={i < review.rating ? 'opacity-100' : 'opacity-30'}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-sm mt-2 text-gray-600 leading-relaxed bg-white p-2 border rounded-xl">{review.comment}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CustomerDashboard({ addToCart }) {
    const [selectedRestaurant, setSelectedRestaurant] = React.useState(null);
    const [restaurants, setRestaurants] = React.useState([]);
    const [menu, setMenu] = React.useState([]);
    const [loadingRestaurants, setLoadingRestaurants] = React.useState(true);
    const [loadingMenu, setLoadingMenu] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [viewingReviewsFor, setViewingReviewsFor] = React.useState(null);

    // Slide Show State
    const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
    // Randomize once when restaurants load
    const [slidingRestaurants, setSlidingRestaurants] = React.useState([]);

    // ดึงรายชื่อร้านอาหารจาก API
    React.useEffect(() => {
        setLoadingRestaurants(true);
        axios.get('/auth/restaurants')
            .then(res => {
                setRestaurants(res.data);
                if (res.data.length > 0) {
                    // สุ่มร้านอาหาร 3-5 ร้านมาโชว์บน Banner
                    const shuffled = [...data].sort(() => 0.5 - Math.random());
                    setSlidingRestaurants(shuffled.slice(0, 5));
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingRestaurants(false));
    }, []);

    // Timer สำหรับเปลี่ยน Slide
    React.useEffect(() => {
        if (slidingRestaurants.length <= 1) return; // ไม่ต้องสไลด์ถ้ามีไม่ถึง 2 ร้าน

        const timer = setInterval(() => {
            setCurrentSlideIndex((prev) => (prev + 1) % slidingRestaurants.length);
        }, 3000); // วนทุก 3 วินาที

        return () => clearInterval(timer);
    }, [slidingRestaurants]);

    // ดึงเมนูของร้านที่เลือก
    const handleSelectRestaurant = async (restaurant) => {
        setLoadingMenu(true);
        setSelectedRestaurant(restaurant);
        try {
            const res = await axios.get(`/items/restaurant/${restaurant._id}`);
            setMenu(Array.isArray(res.data) ? res.data : []);
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
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-[#1a113d]">{selectedRestaurant.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">📍 {selectedRestaurant.address || 'ไม่ระบุที่อยู่'}</p>
                            <p className="text-xs text-gray-500">📞 {selectedRestaurant.phone}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                            <span className="inline-block bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-full text-sm">
                                ⭐ {selectedRestaurant.averageRating > 0 ? selectedRestaurant.averageRating : 'ยังไม่มีรีวิว'} {selectedRestaurant.reviewCount > 0 && `(${selectedRestaurant.reviewCount})`}
                            </span>
                            <button
                                onClick={() => setViewingReviewsFor(selectedRestaurant)}
                                className="text-xs text-indigo-500 hover:text-indigo-700 font-bold underline cursor-pointer border-none bg-transparent p-0"
                            >
                                ดูรีวิวทั้งหมด
                            </button>
                        </div>
                    </div>
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

                {/* Modal ดูรีวิว (สำหรับหน้ารายละเอียดร้าน) */}
                {viewingReviewsFor && (
                    <ReviewListModal
                        restaurant={viewingReviewsFor}
                        onClose={() => setViewingReviewsFor(null)}
                    />
                )}
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
            {/* Banner Slide Show */}
            <div className="relative overflow-hidden shadow-sm bg-yellow-300 rounded-2xl h-40">
                {slidingRestaurants.length > 0 ? (
                    <div
                        className="flex transition-transform duration-500 ease-in-out h-full"
                        style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
                    >
                        {slidingRestaurants.map((r, index) => (
                            <div
                                key={`slide-${index}`}
                                className="w-full h-full flex-shrink-0 relative cursor-pointer group"
                                onClick={() => handleSelectRestaurant(r)}
                            >
                                {/* ถ้ามีรูปร้านอาหาร ให้ใช้รูปเป็น bg หรือใส่รูป (สมมติว่าถ้าไม่มีให้เป็นสีพื้นๆ) */}
                                {r.imageUrl ? (
                                    <div className="absolute inset-0 w-full h-full">
                                        <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-yellow-400 w-full h-full flex items-center justify-center">
                                        <span className="text-6xl opacity-20">🏪</span>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 p-4 w-full">
                                    <h2 className="text-2xl font-bold text-white drop-shadow-md">
                                        {r.name}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs bg-yellow-400 text-[#1a113d] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-yellow-500/50">
                                            ⭐ {r.averageRating > 0 ? r.averageRating : 'New'}
                                        </span>
                                        <span className="text-xs text-white/90 truncate">
                                            {r.address || 'Special Offer!'}
                                        </span>
                                        <span className="text-xs text-white bg-white/20 px-2 py-0.5 rounded-full ml-auto group-hover:bg-white group-hover:text-[#1a113d] transition-colors">
                                            สั่งเลย →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Default Banner ถ้ายังไม่มีข้อมูล
                    <div className="flex flex-col items-center justify-center h-full text-[#1a113d]">
                        <h2 className="text-2xl font-bold mb-1">Special Offers!</h2>
                        <p className="text-sm opacity-80">🔥 ลดแรงทุกวัน 🔥</p>
                    </div>
                )}

                {/* Dots indicator */}
                {slidingRestaurants.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                        {slidingRestaurants.map((_, idx) => (
                            <div
                                key={`dot-${idx}`}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlideIndex ? 'w-4 bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.8)]' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                            ></div>
                        ))}
                    </div>
                )}
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
                                    <p className="text-sm text-gray-500 mb-1">📍 {restaurant.address}</p>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-start gap-1">
                                        <p className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-md">⭐ {restaurant.averageRating > 0 ? restaurant.averageRating : 'ยังไม่มีรีวิว'} {restaurant.reviewCount > 0 && `(${restaurant.reviewCount})`}</p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingReviewsFor(restaurant);
                                            }}
                                            className="text-[10px] text-indigo-500 hover:text-indigo-700 font-bold underline cursor-pointer border-none bg-transparent p-0 pl-1"
                                        >
                                            ดูรีวิวทั้งหมด
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 h-full flex items-center mt-[-15px]">📞 {restaurant.phone}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal ดูรีวิว */}
            {viewingReviewsFor && (
                <ReviewListModal
                    restaurant={viewingReviewsFor}
                    onClose={() => setViewingReviewsFor(null)}
                />
            )}
        </div>
    );
}
