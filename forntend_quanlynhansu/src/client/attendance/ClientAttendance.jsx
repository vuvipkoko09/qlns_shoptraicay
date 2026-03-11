import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AttendanceService from '../../services/AttendanceService';
import FaceCheckInButton from '../../components/FaceCheckInButton';
import { FaClock, FaHistory, FaUserAstronaut, FaCheckCircle, FaFingerprint } from 'react-icons/fa';

export default function ClientAttendance() {
    const { user } = useAuth();
    const [todaySessions, setTodaySessions] = useState([]);
    const [history, setHistory] = useState([]);


    useEffect(() => {
        if (user && (user.id || user.userId)) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        // Lấy ID an toàn (đề phòng trường hợp nó tên là userId)
        const currentUserId = user.id || user.userId;

        try {
            const todayRes = await AttendanceService.getToday(currentUserId);
            const sessions = Array.isArray(todayRes.data) ? todayRes.data : (todayRes.data ? [todayRes.data] : []);
            setTodaySessions(sessions);

            const date = new Date();
            const histRes = await AttendanceService.getHistory(currentUserId, date.getMonth() + 1, date.getFullYear());
            setHistory(histRes.data || []);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
    };

    const activeSession = todaySessions.find(s => s.checkInTime && !s.checkOutTime);

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải thông tin tài khoản...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-emerald-800 flex items-center gap-2 border-b pb-4 border-emerald-200">
                <FaUserAstronaut /> Cổng chấm công khuôn mặt
            </h2>

            {/* --- KHU VỰC CHÍNH: CHẤM CÔNG FACE ID --- */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {/* Header trạng thái */}
                <div className={`p-4 text-center ${activeSession ? 'bg-green-100' : 'bg-blue-50'}`}>
                    <p className={`text-sm font-bold uppercase tracking-widest ${activeSession ? 'text-green-700' : 'text-blue-600'}`}>
                        Trạng thái hiện tại
                    </p>
                    <h3 className={`text-2xl font-bold mt-1 ${activeSession ? 'text-green-800' : 'text-gray-700'}`}>
                        {activeSession ? "● ĐANG LÀM VIỆC" : "⚪ CHƯA VÀO CA"}
                    </h3>
                    {activeSession && (
                        <p className="text-green-700 text-sm mt-1">
                            Bắt đầu lúc: {new Date(activeSession.checkInTime).toLocaleTimeString('vi-VN')}
                        </p>
                    )}
                </div>

                {/* Khu vực nút bấm lớn */}
                <div className="p-10 flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
                    <div className="mb-6 relative">
                        {/* Icon trang trí */}
                        <div className="absolute -inset-4 bg-blue-100 rounded-full opacity-50 blur-lg animate-pulse"></div>
                        <FaFingerprint className="text-6xl text-blue-600 relative z-10" />
                    </div>

                    <p className="text-gray-500 mb-6 text-center max-w-md">
                        {activeSession
                            ? "Vui lòng quét khuôn mặt để kết thúc ca làm việc (Check-out)."
                            : "Vui lòng nhìn thẳng vào Camera và bấm nút bên dưới để bắt đầu (Check-in)."
                        }
                    </p>

                    {/* NÚT FACE ID DUY NHẤT */}
                    <div className="transform scale-125">
                        <FaceCheckInButton
                            onCheckInSuccess={loadData}
                            currentUser={user}
                            
                        />
                    </div>

                    <p className="text-xs text-gray-400 mt-8 italic">
                        * Hệ thống tự động nhận diện Check-in hoặc Check-out.
                    </p>
                </div>
            </div>

            {/* --- HOẠT ĐỘNG TRONG NGÀY --- */}
            {todaySessions.length > 0 && (
                <div className="mt-8">
                    <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider pl-2 border-l-4 border-emerald-500">
                        Hoạt động hôm nay
                    </h4>
                    <div className="space-y-3">
                        {todaySessions.map((session, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${session.checkOutTime ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-600'}`}>
                                        <FaClock />
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-800 text-sm block">Ca làm việc #{idx + 1}</span>
                                        <div className="text-xs text-gray-500 mt-1">
                                            <span className="font-mono text-emerald-600 font-bold">
                                                {new Date(session.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="mx-2">➔</span>
                                            <span className="font-mono text-red-500 font-bold">
                                                {session.checkOutTime
                                                    ? new Date(session.checkOutTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                                                    : '...'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {session.checkOutTime && <FaCheckCircle className="text-emerald-500 text-xl" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- LỊCH SỬ THÁNG --- */}
            <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <FaHistory className="text-gray-400" />
                    <h3 className="font-bold text-gray-700">Lịch sử chấm công</h3>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Ngày</th>
                                <th className="px-6 py-3">Vào / Ra</th>
                                <th className="px-6 py-3 text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-6 text-center text-gray-400">Chưa có dữ liệu tháng này.</td>
                                </tr>
                            ) : (
                                history.map(att => (
                                    <tr key={att.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{att.date}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-green-600 text-xs">IN: {att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString('vi-VN') : '--:--'}</span>
                                                <span className="text-red-500 text-xs">OUT: {att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString('vi-VN') : '--:--'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${att.status === 'LATE' ? 'bg-red-50 text-red-600 border-red-200' :
                                                att.status === 'EARLY_LEAVE' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                    'bg-green-50 text-green-600 border-green-200'
                                                }`}>
                                                {att.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}