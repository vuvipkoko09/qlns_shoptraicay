import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaUsers, 
    FaClipboardList, 
    FaCalendarCheck, 
    FaExclamationCircle, 
    FaArrowRight,
    FaPlusCircle
} from 'react-icons/fa';

// Import Services
import UserAPI from "../services/UserService";
import WorkReportAPI from "../services/WorkReportService";
import WorkScheduleAPI from "../services/WorkScheduleService";

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalStaff: 0,
        pendingReports: 0,
        todayShifts: 0,
        totalReports: 0
    });

    const [todaySchedules, setTodaySchedules] = useState([]);
    const [recentPendingReports, setRecentPendingReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Gọi 3 API song song
            const [usersRes, reportsRes, schedulesRes] = await Promise.all([
                UserAPI.getAll(),
                WorkReportAPI.getAll(),
                WorkScheduleAPI.getAll()
            ]);

            const users = usersRes.data || [];
            const reports = reportsRes.data || [];
            const schedules = schedulesRes.data || [];

            // 1. Tính toán thống kê
            // Lọc nhân viên (trừ admin)
            const staffCount = users.filter(u => u.role !== 'ROLE_ADMIN').length;
            
            // Lọc báo cáo pending
            const pendingList = reports.filter(r => r.status === 'Pending');
            
            // Lọc ca làm việc hôm nay
            const todayStr = new Date().toISOString().split('T')[0];
            const todayShiftList = schedules.filter(s => s.startTime.startsWith(todayStr));

            setStats({
                totalStaff: staffCount,
                pendingReports: pendingList.length,
                todayShifts: todayShiftList.length,
                totalReports: reports.length
            });

            // 2. Dữ liệu chi tiết cho bảng
            setTodaySchedules(todayShiftList);
            setRecentPendingReports(pendingList.slice(0, 5)); // Lấy 5 cái mới nhất

            setLoading(false);
        } catch (error) {
            console.error("Lỗi tải Dashboard:", error);
            setLoading(false);
        }
    };

    // Helper: Xác định ca từ giờ
    const getShiftLabel = (dateString) => {
        const h = new Date(dateString).getHours();
        if (h >= 1 && h < 12) return { text: 'Sáng', color: 'bg-orange-100 text-orange-700' };
        if (h >= 12 && h < 18) return { text: 'Chiều', color: 'bg-yellow-100 text-yellow-700' };
        return { text: 'Tối', color: 'bg-indigo-100 text-indigo-700' };
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải thống kê...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">👋 Xin chào, Admin!</h1>

            {/* --- 1. CARDS THỐNG KÊ --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Card 1: Nhân viên */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Tổng Nhân viên</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalStaff}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xl">
                        <FaUsers />
                    </div>
                </div>

                {/* Card 2: Ca làm hôm nay */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Ca làm hôm nay</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.todayShifts}</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 text-xl">
                        <FaCalendarCheck />
                    </div>
                </div>

                {/* Card 3: Báo cáo chờ duyệt */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden">
                    {stats.pendingReports > 0 && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>}
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Chờ duyệt</p>
                        <h3 className="text-3xl font-bold text-red-600 mt-1">{stats.pendingReports}</h3>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 text-xl">
                        <FaExclamationCircle />
                    </div>
                </div>

                {/* Card 4: Tổng báo cáo */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Tổng Báo cáo</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalReports}</h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 text-xl">
                        <FaClipboardList />
                    </div>
                </div>
            </div>

            {/* --- 2. KHU VỰC CHÍNH (2 CỘT) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Cột Trái: Lịch làm việc hôm nay */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">📅 Lịch làm việc hôm nay</h2>
                        <Link to="/admin/workschedule" className="text-sm text-blue-600 hover:underline">Xem tất cả</Link>
                    </div>
                    
                    <div className="overflow-y-auto max-h-[300px] pr-2">
                        {todaySchedules.length > 0 ? (
                            <div className="space-y-3">
                                {todaySchedules.map(s => {
                                    const shiftInfo = getShiftLabel(s.startTime);
                                    return (
                                        <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                                    {(s.user?.username || "U").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-800">{s.user?.fullName || s.user?.username}</p>
                                                    <p className="text-xs text-gray-500">{s.title}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${shiftInfo.color}`}>
                                                {shiftInfo.text}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 italic">
                                Không có lịch làm việc nào hôm nay.
                            </div>
                        )}
                    </div>
                </div>

                {/* Cột Phải: Báo cáo cần duyệt */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">📝 Cần duyệt gấp ({stats.pendingReports})</h2>
                        <Link to="/admin/work-report" className="text-sm text-blue-600 hover:underline">Xem tất cả</Link>
                    </div>

                    <div className="overflow-y-auto max-h-[300px] pr-2">
                        {recentPendingReports.length > 0 ? (
                            <div className="space-y-3">
                                {recentPendingReports.map(r => (
                                    <div key={r.id} className="p-3 border rounded-lg hover:shadow-md transition bg-white group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-sm text-gray-800 mb-1">
                                                    {r.user?.fullName || "Nhân viên"}
                                                </div>
                                                <div className="text-xs text-gray-500 line-clamp-1">
                                                    {r.workDone}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Ngày: {new Date(r.reportDate).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                            <Link 
                                                to={`/admin/work-report/edit/${r.id}`}
                                                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                                            >
                                                Duyệt
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-green-500 italic flex flex-col items-center">
                                <FaCheckCircle className="text-4xl mb-2 opacity-50"/>
                                Tuyệt vời! Đã duyệt hết báo cáo.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- 3. QUICK ACTIONS (LỐI TẮT) --- */}
            <div className="mt-8">
                <h3 className="text-gray-500 font-bold mb-4 text-sm uppercase tracking-wider">Lối tắt quản lý</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/admin/users/create" className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col items-center justify-center gap-2 group">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                            <FaPlusCircle />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-blue-600 text-sm">Thêm Nhân viên</span>
                    </Link>

                    <Link to="/admin/workschedule/create" className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-green-300 transition flex flex-col items-center justify-center gap-2 group">
                        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition">
                            <FaCalendarCheck />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-green-600 text-sm">Phân Ca Mới</span>
                    </Link>

                    <Link to="/admin/work-report" className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-purple-300 transition flex flex-col items-center justify-center gap-2 group">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
                            <FaClipboardList />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-purple-600 text-sm">Duyệt Báo Cáo</span>
                    </Link>

                    <Link to="/admin/workschedule" className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md hover:border-orange-300 transition flex flex-col items-center justify-center gap-2 group">
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition">
                            <FaArrowRight />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-orange-600 text-sm">Xem Tổng Quan</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Icon check cho trạng thái trống
function FaCheckCircle({className}) {
    return (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className={className} xmlns="http://www.w3.org/2000/svg"><path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628 0z"></path></svg>
    )
}