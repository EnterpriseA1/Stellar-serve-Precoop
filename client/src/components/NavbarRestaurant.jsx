import React from 'react';

export default function NavbarRestaurant({ currentTab, setCurrentTab }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-3xl">
            <div className="flex justify-around items-center text-[#1a113d]">
                {/* ปุ่ม Home */}
                <button
                    onClick={() => setCurrentTab('home')}
                    className={`flex flex-col items-center gap-1 transition ${currentTab === 'home' ? 'text-yellow-500 font-bold' : 'opacity-60'}`}
                >
                    <span className="text-2xl">🏠</span>
                    <span className="text-xs">Home</span>
                </button>

                {/* ปุ่ม Menu */}
                <button
                    onClick={() => setCurrentTab('menu')}
                    className={`flex flex-col items-center gap-1 transition ${currentTab === 'menu' ? 'text-yellow-500 font-bold' : 'opacity-60'}`}
                >
                    <span className="text-2xl">🍔</span>
                    <span className="text-xs">Menu</span>
                </button>

                {/* ปุ่ม Orders */}
                <button
                    onClick={() => setCurrentTab('orders')}
                    className={`flex flex-col items-center gap-1 transition ${currentTab === 'orders' ? 'text-yellow-500 font-bold' : 'opacity-60'}`}
                >
                    <span className="text-2xl">📋</span>
                    <span className="text-xs">Orders</span>
                </button>

                {/* ปุ่ม Profile */}
                <button
                    onClick={() => setCurrentTab('profile')}
                    className={`flex flex-col items-center gap-1 transition ${currentTab === 'profile' ? 'text-yellow-500 font-bold' : 'opacity-60'}`}
                >
                    <span className="text-2xl">👤</span>
                    <span className="text-xs">Profile</span>
                </button>
            </div>
        </div>
    );
}
