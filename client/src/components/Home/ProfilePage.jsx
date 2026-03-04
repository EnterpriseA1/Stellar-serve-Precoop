import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage({ user }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="p-6">
            <h2 className="mb-6 text-2xl font-bold text-[#1a113d]">My Profile</h2>
            <div className="p-6 text-center bg-white rounded-3xl shadow-sm mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
                    👤
                </div>
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-gray-500">@{user.username}</p>
                <p className="mt-2 text-sm font-bold text-yellow-500 uppercase">{user.role}</p>
            </div>

            <div className="space-y-3">
                <button className="w-full p-4 text-left bg-white rounded-2xl shadow-sm font-bold flex justify-between">
                    <span>Account Settings</span>
                    <span className="text-gray-400">{'>'}</span>
                </button>
                <button className="w-full p-4 text-left bg-white rounded-2xl shadow-sm font-bold flex justify-between">
                    <span>Help Center</span>
                    <span className="text-gray-400">{'>'}</span>
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full p-4 mt-6 font-bold text-center text-white bg-red-500 rounded-full shadow hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
