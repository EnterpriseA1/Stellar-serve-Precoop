import React from 'react';

export default function SearchPage() {
    return (
        <div className="p-6">
            <h2 className="mb-4 text-2xl font-bold text-[#1a113d]">Search</h2>
            <div className="relative">
                <input
                    type="text"
                    placeholder="ค้นหาร้านอาหาร หรือ เมนู..."
                    className="w-full px-5 py-3 pl-10 bg-white shadow-sm border-none rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <span className="absolute top-3 left-4 text-gray-400">🔍</span>
            </div>
            <div className="mt-8 text-center text-gray-400">
                <p>พิมพ์คำค้นหาเพื่อเริ่ม</p>
            </div>
        </div>
    );
}
