import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ClientSidebar from './ClientSidebar';
import { FaBars } from "react-icons/fa";

const ClientLayout = () => {
    // Logic thông minh: Nếu màn hình lớn (>768px) thì mặc định Mở, nhỏ thì Đóng
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Trên mobile, khi bấm vào link chuyển trang thì nên tự đóng menu lại
    // Trên desktop thì không cần đóng
    const handleCloseOnMobile = () => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 relative">
            
            {/* --- 1. NÚT 3 GẠCH --- */}
            {/* Đã xóa class 'md:hidden' để nó hiện trên cả Desktop */}
            <div className="fixed top-4 left-4 z-50">
                <button 
                    onClick={toggleSidebar}
                    className="bg-emerald-800 text-white p-2 rounded shadow-lg hover:bg-emerald-700 transition"
                >
                    <FaBars className="text-xl"/>
                </button>
            </div>

            {/* --- 2. SIDEBAR --- */}
            {/* Truyền hàm closeMobile để sidebar biết tự đóng khi click link trên mobile */}
            <ClientSidebar isOpen={isSidebarOpen} closeMobile={handleCloseOnMobile} />

            {/* --- 3. OVERLAY (Chỉ hiện trên Mobile khi mở menu) --- */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* --- 4. NỘI DUNG CHÍNH --- */}
            {/* Logic CSS: 
                - Mobile: Luôn full màn hình (ml-0), sidebar đè lên.
                - Desktop (md): Nếu mở -> Lùi vào 64 (ml-64). Nếu đóng -> Full màn (ml-0).
            */}
            <main 
                className={`
                    flex-1 p-6 overflow-auto w-full transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'} 
                `}
            >
                {/* Padding top để tránh nút 3 gạch che mất nội dung */}
                <div className="mt-12"> 
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ClientLayout;