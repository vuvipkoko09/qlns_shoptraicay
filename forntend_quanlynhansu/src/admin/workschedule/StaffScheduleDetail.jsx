import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import WorkScheduleAPI from "../../services/WorkScheduleService";
import UserAPI from "../../services/UserService";
import { FaChevronLeft, FaChevronRight, FaCalendarDay, FaCalendarWeek, FaSpinner } from 'react-icons/fa';

export default function StaffScheduleDetail() {
    const { userId } = useParams();
    const [searchParams] = useSearchParams();

    // State
    const [viewMode, setViewMode] = useState('DAY');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState([]);
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(false); // Thêm loading

    // Format ngày chuẩn YYYY-MM-DD để so sánh chính xác
    const formatDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Khởi tạo ngày từ URL
    useEffect(() => {
        const dateParam = searchParams.get('date');
        if (dateParam) {
            // Fix lỗi timezone khi parse string "2025-12-10"
            setCurrentDate(new Date(dateParam));
        }
    }, []);
    const getLocalDateString = (dateTimeString) => {
        if (!dateTimeString) return '';
        return dateTimeString.substring(0, 10);
    };
    // Load data
    useEffect(() => {
        loadData();
    }, [userId, currentDate, viewMode]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (!staff) {
                const userRes = await UserAPI.getAll();
                const targetStaff = userRes.data.find(u => String(u.id) === String(userId));
                setStaff(targetStaff);
            }

            const scheduleRes = await WorkScheduleAPI.getAll();

            const startCheck = viewMode === 'DAY' ? currentDate : getStartOfWeek(currentDate);
            const endCheck = viewMode === 'DAY' ? currentDate : addDays(startCheck, 6);

            // Ngày bắt đầu và kết thúc của View (đã chuẩn hóa chuỗi)
            const viewStartStr = formatDateKey(startCheck);
            const viewEndStr = formatDateKey(endCheck);

            const filtered = scheduleRes.data.filter(s => {
                // Check User
                const isRightUser = (String(s.userId) === String(userId) || (s.user && String(s.user.id) === String(userId)));
                if (!isRightUser) return false;

                // --- ĐOẠN SỬA QUAN TRỌNG ---
                const taskStartStr = getLocalDateString(s.startTime); // Ngày bắt đầu ca
                const taskEndStr = getLocalDateString(s.endTime);     // Ngày kết thúc ca

                if (viewMode === 'DAY') {
                    // Hiển thị nếu: Ngày đang xem trùng ngày bắt đầu HOẶC trùng ngày kết thúc
                    // Ví dụ: Ca đêm 9 sang 10 -> Xem ngày 9 cũng thấy, xem ngày 10 cũng thấy
                    return viewStartStr === taskStartStr || viewStartStr === taskEndStr;
                } else {
                    // Logic tuần: Lấy các ca có ngày bắt đầu nằm trong tuần
                    return taskStartStr >= viewStartStr && taskStartStr <= viewEndStr;
                }
            });

            setSchedules(filtered);
        } catch (error) {
            console.error("Lỗi tải lịch:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- UTILS ---
    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay(); // 0 (Sun) -> 6 (Sat)
        // Nếu muốn tuần bắt đầu từ Thứ 2: day === 0 ? -6 : 1
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const handlePrev = () => {
        const days = viewMode === 'DAY' ? -1 : -7;
        setCurrentDate(addDays(currentDate, days));
    };

    const handleNext = () => {
        const days = viewMode === 'DAY' ? 1 : 7;
        setCurrentDate(addDays(currentDate, days));
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa lịch này?")) {
            try {
                await WorkScheduleAPI.delete(id);
                loadData();
            } catch (e) {
                alert("Xóa thất bại");
            }
        }
    };

    // --- RENDER ---

    // Memoize render tuần để đỡ lag khi state thay đổi nhẹ
    const weekDays = useMemo(() => {
        const start = getStartOfWeek(currentDate);
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, [currentDate]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm min-h-screen">
            {/* Header: Giữ nguyên như cũ, chỉ thêm loading indicator nếu cần */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <Link to="/admin/workschedule" className="text-gray-500 hover:underline text-sm mb-1 block">
                        &larr; Quay lại
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shadow-sm shrink-0">
                            <img
                                src={
                                    staff?.fileName
                                        ? `http://localhost:8080/images/users/${staff.fileName}`
                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(staff?.fullName || staff?.username || "User")}&background=random&color=fff&size=128`
                                }
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(staff?.fullName || staff?.username || "User")}&background=random&color=fff&size=128`;
                                }}
                            />
                        </div>
                        {staff ? (staff.fullName || staff.username) : 'Đang tải...'}
                    </h1>
                </div>

                <div className="flex items-center gap-4 bg-gray-100 p-1.5 rounded-lg">
                    {/* View Mode Switcher */}
                    <div className="flex bg-white rounded shadow-sm overflow-hidden">
                        <button onClick={() => setViewMode('DAY')} className={`px-3 py-1.5 flex items-center gap-2 text-sm font-medium transition ${viewMode === 'DAY' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <FaCalendarDay /> Ngày
                        </button>
                        <button onClick={() => setViewMode('WEEK')} className={`px-3 py-1.5 flex items-center gap-2 text-sm font-medium transition ${viewMode === 'WEEK' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <FaCalendarWeek /> Tuần
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
                        <button onClick={handlePrev} className="p-1.5 hover:bg-white rounded transition"><FaChevronLeft /></button>
                        <span className="font-bold min-w-[150px] text-center text-sm">
                            {viewMode === 'DAY'
                                ? currentDate.toLocaleDateString('vi-VN')
                                : `Tuần ${weekDays[0].getDate()}/${weekDays[0].getMonth() + 1} - ${weekDays[6].getDate()}/${weekDays[6].getMonth() + 1}`
                            }
                        </span>
                        <button onClick={handleNext} className="p-1.5 hover:bg-white rounded transition"><FaChevronRight /></button>
                    </div>
                </div>
            </div>

            {/* Nút thêm mới */}
            <div className="mb-4 flex justify-between items-center">
                {loading && <div className="text-blue-500 flex items-center gap-2"><FaSpinner className="animate-spin" /> Đang tải dữ liệu...</div>}
                {!loading && <div></div>} {/* Spacer */}

                <Link
                    to={`/admin/workschedule/create?userId=${userId}&date=${formatDateKey(currentDate)}`}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition flex items-center gap-2"
                >
                    <span>+</span> Thêm việc {viewMode === 'DAY' ? 'ngày này' : 'trong tuần'}
                </Link>
            </div>

            {/* Content */}
            {viewMode === 'DAY' ? (
                // --- TABLE VIEW (DAY) ---
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left">Tiêu đề</th>
                                <th className="p-3 text-left">Thời gian</th>
                                <th className="p-3 text-center">KPI</th>
                                <th className="p-3 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.length > 0 ? schedules.map(item => (
                                <tr key={item.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3 font-medium">{item.title}</td>
                                    <td className="p-3 text-sm">
                                        <div>{item.startTime.substring(11, 16)} <span className='text-gray-400'>➜</span> {item.endTime.substring(11, 16)}</div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                                            {item.targetAmount} {item.unit}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center gap-2">
                                        <Link to={`/admin/workschedule/edit/${item.id}`} className="text-blue-600 hover:underline mr-3">Sửa</Link>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Xóa</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-400 italic">Không có lịch làm việc</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                // --- GRID VIEW (WEEK) ---
                <div className="grid grid-cols-7 border rounded-lg overflow-hidden bg-gray-200 gap-[1px]">
                    {weekDays.map((day, index) => {
                        // So sánh chuỗi ngày (YYYY-MM-DD) thay vì so sánh object Date
                        const dayStr = formatDateKey(day);
                        const todayStr = formatDateKey(new Date());
                        const isToday = dayStr === todayStr;

                        const dayTasks = schedules.filter(s => getLocalDateString(s.startTime) === dayStr);

                        return (
                            <div key={index} className={`min-h-[200px] flex flex-col ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
                                <div className={`p-2 text-center border-b font-bold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                                    <div className="text-xs uppercase">{day.toLocaleDateString('vi-VN', { weekday: 'short' })}</div>
                                    <div className="text-lg">{day.getDate()}</div>
                                </div>

                                <div className="p-2 flex-1 flex flex-col gap-2">
                                    {dayTasks.map(task => (
                                        <div key={task.id} className="text-xs p-2 bg-white border border-gray-200 rounded shadow-sm hover:border-blue-400 group relative">
                                            <div className="font-bold truncate">{task.title}</div>
                                            <div className="text-gray-500">
                                                {task.startTime.substring(11, 16)} - {task.endTime.substring(11, 16)}
                                            </div>
                                            <div className="hidden group-hover:flex absolute top-1 right-1 bg-white border rounded shadow">
                                                <Link to={`/admin/workschedule/edit/${task.id}`} className="p-1 hover:text-blue-600">✏️</Link>
                                                <button onClick={() => handleDelete(task.id)} className="p-1 hover:text-red-600">🗑️</button>
                                            </div>
                                        </div>
                                    ))}

                                    <Link
                                        to={`/admin/workschedule/create?userId=${userId}&date=${dayStr}`}
                                        className="mt-auto w-full text-center text-gray-300 hover:text-green-600 hover:bg-green-50 rounded text-xl"
                                    >
                                        +
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}