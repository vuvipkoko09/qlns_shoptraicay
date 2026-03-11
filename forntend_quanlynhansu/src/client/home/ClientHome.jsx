import { useEffect, useState } from "react";
import WorkScheduleService from "../../services/WorkScheduleService";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaClock, FaCalendarDay, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

export default function ClientHome() {
    const { user } = useAuth(); // Lấy user từ context
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, TODAY, UPCOMING, OVERDUE

    useEffect(() => {
        loadMySchedules();
    }, [user]);

    const loadMySchedules = async () => {
        try {
            const res = await WorkScheduleService.getAll();
            // Lọc công việc của chính user này
            const mySchedules = res.data
                .filter(s => s.userId == user.userId || s.user?.id == user.userId)
                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

            setSchedules(mySchedules);
        } catch (error) {
            console.error("Lỗi tải lịch:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- HÀM XÁC ĐỊNH CA ---
    const getShiftInfo = (dateString) => {
        const h = new Date(dateString).getHours();
        if (h >= 6 && h < 12) return { label: 'Ca Sáng', icon: '🌅', color: 'text-orange-600 bg-orange-100' };
        if (h >= 12 && h < 18) return { label: 'Ca Chiều', icon: '☀️', color: 'text-yellow-600 bg-yellow-100' };
        return { label: 'Ca Tối', icon: '🌙', color: 'text-indigo-600 bg-indigo-100' };
    };

    const isToday = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    };

    // Lọc danh sách theo filter
    const filteredSchedules = schedules.filter(item => {
        const itemDate = new Date(item.startTime);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (filter === 'TODAY') return isToday(item.startTime);
        if (filter === 'UPCOMING') return itemDate > today;
        if (filter === 'OVERDUE') return itemDate < today && !isToday(item.startTime);
        return true;
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải nhiệm vụ...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6">
            {/* Header: Tổng quan */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl p-6 md:p-8 text-white shadow-lg mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Xin chào, {user?.fullName || user?.username}! 👋</h1>
                <p className="opacity-90">
                    Hôm nay bạn có <span className="font-bold text-yellow-300 text-xl mx-1">{schedules.filter(s => isToday(s.startTime)).length}</span> công việc.
                    Chúc bạn một ngày làm việc hiệu quả! 🍎
                </p>
            </div>

            {/* Thanh Bộ Lọc */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'ALL' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    Tất cả
                </button>
                <button onClick={() => setFilter('TODAY')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'TODAY' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                    Hôm nay
                </button>
                <button onClick={() => setFilter('UPCOMING')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'UPCOMING' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}>
                    Sắp tới
                </button>
                <button onClick={() => setFilter('OVERDUE')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'OVERDUE' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                    Quá hạn
                </button>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📋</span> Danh sách công việc
            </h2>

            {filteredSchedules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSchedules.map((item) => {
                        const active = isToday(item.startTime);
                        const shift = getShiftInfo(item.startTime);
                        const isOverdue = new Date(item.endTime) < new Date();

                        return (
                            <div key={item.id} className={`relative flex flex-col bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group ${active ? 'border-emerald-500 ring-1 ring-emerald-100' : 'border-gray-200'}`}>
                                
                                {/* Badge Gấp / Quá hạn */}
                                <div className="absolute top-3 right-3 flex gap-1">
                                    {isOverdue && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1"><FaExclamationTriangle/> QUÁ HẠN</span>}
                                    {active && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded animate-pulse">HÔM NAY</span>}
                                </div>

                                <div className="p-5 flex-1">
                                    {/* CA LÀM VIỆC */}
                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold mb-3 ${shift.color}`}>
                                        <span>{shift.icon}</span> {shift.label}
                                    </div>

                                    {/* TIÊU ĐỀ CÔNG VIỆC (LÀM GÌ) */}
                                    <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-emerald-700 transition line-clamp-2" title={item.title}>
                                        {item.title}
                                    </h3>

                                    {/* CHỈ TIÊU (KPI) */}
                                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                        <span className="font-bold">Mục tiêu:</span>
                                        <span className="font-bold text-blue-600 text-lg">{item.targetAmount}</span>
                                        <span className="text-gray-500">{item.unit}</span>
                                    </div>

                                    {/* THỜI GIAN */}
                                    <div className="space-y-1 text-sm text-gray-500 mb-3">
                                        <div className="flex items-center gap-2">
                                            <FaClock className="text-emerald-500"/> 
                                            <span>{new Date(item.startTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})} - {new Date(item.endTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaCalendarDay className="text-blue-400"/>
                                            <span>{new Date(item.startTime).toLocaleDateString('vi-VN', {weekday: 'long', day:'numeric', month:'numeric'})}</span>
                                        </div>
                                    </div>

                                    {/* GHI CHÚ */}
                                    {item.notes && (
                                        <p className="text-sm text-gray-500 italic line-clamp-2">"{item.notes}"</p>
                                    )}
                                </div>

                                {/* FOOTER ACTION */}
                                <div className="p-4 border-t bg-gray-50 rounded-b-xl flex gap-2">
                                    {/* Nút Xem chi tiết */}
                                    <Link 
                                        to={`/client/workschedule/detail/${item.id}`}
                                        className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-center py-2 rounded-lg font-medium text-sm transition"
                                    >
                                        Xem chi tiết
                                    </Link>
                                    
                                    {/* Nút Báo cáo nhanh */}
                                    <Link 
                                        to={`/client/work-report/create?scheduleId=${item.id}`} 
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center py-2 rounded-lg font-medium text-sm transition shadow-sm flex items-center justify-center gap-1"
                                    >
                                        <FaCheckCircle /> Báo cáo
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="text-4xl mb-3">🌴</div>
                    <p className="text-gray-500 text-lg">Không tìm thấy công việc nào trong mục này.</p>
                </div>
            )}
        </div>
    );
}