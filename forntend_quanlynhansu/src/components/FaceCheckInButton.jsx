import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
// Import API Check-out thủ công của bạn
import AttendanceAPI from '../services/AttendanceService';

const FaceCheckInButton = ({ onCheckInSuccess, currentUser }) => { 
    const [loading, setLoading] = useState(false);
    const performCheckOut = async (userId) => {
        try {
            await AttendanceAPI.checkOut(userId); 
            toast.success("👋 Check-out thành công! Hẹn gặp lại.");
            if (onCheckInSuccess) onCheckInSuccess();
        } catch (err) {
            const msg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : err.message) || "Lỗi Check-out";
            toast.error("❌ " + msg);
        }
    };

    const handleFaceCheckIn = async () => {
        // --- 1. KIỂM TRA QUAN TRỌNG: Đảm bảo có user trước khi chạy ---
        if (!currentUser || !currentUser.userId) {
            toast.error("⚠️ Lỗi: Không tìm thấy thông tin người dùng đang đăng nhập!");
            return;
        }

        setLoading(true);
        toast.info("📸 Đang bật Camera AI...", { autoClose: 2000 });

        try {
            // 2. Gọi Python để lấy khuôn mặt
            const pyResponse = await axios.get("http://localhost:5000/start-scan");
            
            if (pyResponse.data.status === 'success') {
                const detectedId = String(pyResponse.data.user_id); // ID từ Camera
                const currentId = String(currentUser.userId);      

                // --- 3. KIỂM TRA BẢO MẬT: SO SÁNH 2 ID ---
                if (detectedId !== currentId) {
                    toast.error(`⛔ SAI NGƯỜI DÙNG!\n\nBạn đang đăng nhập tài khoản ID ${currentId}\nNhưng Camera lại thấy ID ${detectedId}`);
                    // Không cần throw error ở đây, chỉ cần return để dừng và tắt loading ở finally
                    return; 
                }

                // --- 4. NẾU ĐÚNG NGƯỜI -> GỌI JAVA ĐỂ CHECK-IN/OUT ---
                try {
                    // Gọi API Java
                    const javaResponse = await axios.post("http://localhost:8080/api/attendance/face-checkin", {
                        userId: detectedId
                    });

                    const serverMsg = javaResponse.data;

                    if (serverMsg === "CONFIRM_CHECKOUT") {
                         // Lưu ý: window.confirm chặn UI, có thể thay thế bằng Modal nếu cần UX tốt hơn
                         const isConfirmed = window.confirm("Bạn có muốn Check-out không?");
                         if (isConfirmed) {
                             await performCheckOut(detectedId); // Tái sử dụng hàm performCheckOut để code gọn hơn
                         }
                    } else {
                        toast.success(`✅ ${serverMsg}`);
                        if (onCheckInSuccess) onCheckInSuccess();
                    }

                } catch (javaErr) {
                    const msg = javaErr.response?.data?.message || (typeof javaErr.response?.data === 'string' ? javaErr.response?.data : javaErr.message) || "Lỗi Server Java";
                    toast.error("Lỗi Server Java: " + msg);
                }
            }

        } catch (error) {
            // Xử lý lỗi từ Python (Timeout, Người lạ, Lỗi mạng...)
            const msg = error.response?.data?.message || error.message || "Lỗi kết nối Camera";
            toast.error("❌ " + msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleFaceCheckIn}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-bold shadow-lg transition-all 
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95'}`}
        >
            {loading ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang xử lý...</span>
                </>
            ) : (
                <>
                    <span className="text-xl">📸</span>
                    <span>Chấm Công Khuôn Mặt</span>
                </>
            )}
        </button>
    );
};

export default FaceCheckInButton;