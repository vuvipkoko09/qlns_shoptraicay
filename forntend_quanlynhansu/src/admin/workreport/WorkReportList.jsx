import { useEffect, useState, useCallback } from "react";
import WorkReportAPI from "../../services/WorkReportService";
import UserAPI from "../../services/UserService";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaList, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function WorkReportList() {
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [viewMode, setViewMode] = useState('WEEKLY_GRID');
    const [currentDate, setCurrentDate] = useState(new Date());

    const loadData = useCallback(async () => {
        try {
            const [reportRes, userRes] = await Promise.all([
                WorkReportAPI.getAll(),
                UserAPI.getAll()
            ]);
            if (reportRes?.data) setReports(reportRes.data);
            if (userRes?.data) setUsers(userRes.data);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDelete = async (id) => {
        if (window.confirm("Xóa báo cáo này?")) {
            await WorkReportAPI.delete(id);
            loadData();
        }
    };

    // --- HELPER LẤY USER ---
    const getUser = (userId) => {
        return users.find(u => u.id === userId);
    };

    // --- 1. SỬA LỖI NGÀY: Dùng UTC ---
    const formatDateKey = (date) => {
        const d = new Date(date);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay(); 
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));

    // --- 2. SỬA LỖI GIỜ ---
    const SHIFTS = [
        { id: 'MORNING', label: '🌅 Sáng', time: '6h - 13h', color: 'bg-orange-50 border-orange-100 text-orange-800' },
        { id: 'AFTERNOON', label: '☀️ Chiều', time: '13h - 18h', color: 'bg-yellow-50 border-yellow-100 text-yellow-800' },
        { id: 'EVENING', label: '🌙 Tối', time: '18h - 6h', color: 'bg-indigo-50 border-indigo-100 text-indigo-800' }
    ];

    const getShift = (dateString) => {
        const date = new Date(dateString);
        const h = date.getUTCHours(); 
        if (h >= 6 && h < 13) return 'MORNING'; 
        if (h >= 13 && h < 18) return 'AFTERNOON';
        return 'EVENING'; 
    };

    // --- 3. LỌC DỮ LIỆU ---
    const getReportsInCell = (day, shiftId) => {
        const year = day.getFullYear();
        const month = String(day.getMonth() + 1).padStart(2, '0');
        const d = String(day.getDate()).padStart(2, '0');
        const colDateStr = `${year}-${month}-${d}`;

        return reports.filter(r => {
            if (!r.reportDate) return false;
            const rDateStr = formatDateKey(r.reportDate);
            return rDateStr === colDateStr && getShift(r.reportDate) === shiftId;
        });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải báo cáo...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý Báo Cáo</h2>
                
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setViewMode('WEEKLY_GRID')} className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition ${viewMode === 'WEEKLY_GRID' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <FaCalendarAlt /> Lịch Tuần
                        </button>
                        <button onClick={() => setViewMode('LIST_TABLE')} className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition ${viewMode === 'LIST_TABLE' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <FaList /> Danh sách
                        </button>
                    </div>
                    
                    <Link to="/admin/work-report/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow flex items-center gap-2">
                        <span>+</span> Tạo hộ
                    </Link>
                </div>
            </div>

            {/* --- VIEW 1: LỊCH BÁO CÁO TUẦN (GRID) --- */}
            {viewMode === 'WEEKLY_GRID' && (
                <div>
                    <div className="flex items-center justify-center gap-4 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="p-2 hover:bg-white rounded shadow-sm"><FaChevronLeft/></button>
                        <span className="font-bold text-lg min-w-[250px] text-center">
                            {startOfWeek.toLocaleDateString('vi-VN')} - {addDays(startOfWeek, 6).toLocaleDateString('vi-VN')}
                        </span>
                        <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 hover:bg-white rounded shadow-sm"><FaChevronRight/></button>
                        <button onClick={() => setCurrentDate(new Date())} className="text-sm text-blue-600 font-bold hover:underline">Hôm nay</button>
                    </div>

                    <div className="overflow-x-auto border rounded-xl shadow-sm">
                        <table className="w-full min-w-[1200px] border-collapse table-fixed">
                            <thead>
                                <tr className="bg-emerald-800 text-white">
                                    <th className="w-32 p-4 border-r border-emerald-700">Ca / Thứ</th>
                                    {weekDays.map((day, i) => {
                                        const today = new Date();
                                        const isToday = day.getDate() === today.getDate() && day.getMonth() === today.getMonth();
                                        
                                        return (
                                            <th key={i} className={`p-3 border-r border-emerald-700 text-center ${isToday ? 'bg-emerald-600 ring-2 ring-emerald-400 z-10' : ''}`}>
                                                <div className="text-xs opacity-80 uppercase">{day.toLocaleDateString('en-US', {weekday: 'short'})}</div>
                                                <div className="font-bold text-xl">{day.getDate()}</div>
                                            </th>
                                        )
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {SHIFTS.map(shift => (
                                    <tr key={shift.id} className="border-b last:border-b-0">
                                        <td className={`p-4 border-r text-center align-middle ${shift.color}`}>
                                            <div className="text-2xl mb-1">
                                                {shift.id === 'MORNING' ? '🌅' : shift.id === 'AFTERNOON' ? '☀️' : '🌙'}
                                            </div>
                                            <div className="text-lg font-bold uppercase">{shift.label.split(' ')[1]}</div>
                                            <div className="text-xs font-medium opacity-75 mt-1">{shift.time}</div>
                                        </td>

                                        {weekDays.map((day, idx) => {
                                            const cellReports = getReportsInCell(day, shift.id);
                                            const today = new Date();
                                            const isToday = day.getDate() === today.getDate() && day.getMonth() === today.getMonth();

                                            return (
                                                <td key={idx} className={`p-2 border-r border-gray-100 align-top h-32 hover:bg-gray-50 transition relative ${isToday ? 'bg-blue-50/30' : ''}`}>
                                                    <div className="flex flex-col gap-1.5 h-full overflow-y-auto custom-scrollbar">
                                                        {cellReports.length > 0 ? cellReports.map(r => {
                                                            let statusColor = 'bg-white border-gray-300 hover:border-blue-400';
                                                            if (r.status === 'APPROVED') statusColor = 'bg-green-50 border-green-200 hover:border-green-400';
                                                            if (r.status === 'REJECTED') statusColor = 'bg-red-50 border-red-200 hover:border-red-400';

                                                            // --- XỬ LÝ ẢNH USER CHO GRID ---
                                                            const user = getUser(r.userId);
                                                            const userName = user ? (user.fullName || user.username) : `ID: ${r.userId}`;
                                                            const avatarSrc = user?.fileName 
                                                                ? `http://localhost:8080/images/users/${user.fileName}` 
                                                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=64`;

                                                            return (
                                                                <Link 
                                                                    key={r.id}
                                                                    to={`/admin/work-report/edit/${r.id}`}
                                                                    className={`p-2 rounded-lg border shadow-sm transition group cursor-pointer ${statusColor}`}
                                                                    title={r.workDone}
                                                                >
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        {/* --- AVATAR NHỎ (20px) --- */}
                                                                        <img 
                                                                            src={avatarSrc} 
                                                                            alt="Avt" 
                                                                            className="w-5 h-5 rounded-full object-cover border border-gray-300 bg-gray-100"
                                                                            onError={(e) => {
                                                                                e.target.onerror = null;
                                                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=64`;
                                                                            }}
                                                                        />
                                                                        <span className="text-xs font-bold text-gray-800 truncate flex-1">{userName}</span>
                                                                        {r.actualAmount > 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded font-mono">SL:{r.actualAmount}</span>}
                                                                    </div>
                                                                    <div className="text-[11px] text-gray-600 line-clamp-2 leading-tight">
                                                                        {r.workDone}
                                                                    </div>
                                                                </Link>
                                                            );
                                                        }) : (
                                                            <div className="flex-1 flex items-center justify-center text-xs text-gray-300 italic select-none">Trống</div>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 italic text-right">* Bấm vào thẻ để duyệt hoặc sửa báo cáo.</div>
                </div>
            )}

            {/* --- VIEW 2: DANH SÁCH BẢNG --- */}
            {viewMode === 'LIST_TABLE' && (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="py-3 px-4 text-left text-sm font-bold text-gray-700">Nhân viên</th>
                                <th className="py-3 px-4 text-left text-sm font-bold text-gray-700">Thời gian</th>
                                <th className="py-3 px-4 text-left text-sm font-bold text-gray-700">Nội dung</th>
                                <th className="py-3 px-4 text-center text-sm font-bold text-blue-800 bg-blue-50 border-x border-blue-100">SL</th>
                                <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">Trạng thái</th>
                                <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length > 0 ? reports.map((r) => {
                                // --- XỬ LÝ ẢNH USER CHO LIST ---
                                const user = getUser(r.userId);
                                const userName = user ? (user.fullName || user.username) : `ID: ${r.userId}`;
                                const avatarSrc = user?.fileName 
                                    ? `http://localhost:8080/images/users/${user.fileName}` 
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=128`;

                                return (
                                    <tr key={r.id} className="hover:bg-gray-50 transition border-b last:border-0">
                                        <td className="py-3 px-4 text-sm font-bold text-blue-900">
                                            {/* --- AVATAR + TÊN --- */}
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={avatarSrc} 
                                                    alt="Avt" 
                                                    className="w-8 h-8 rounded-full object-cover border border-gray-200 bg-gray-100"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=128`;
                                                    }}
                                                />
                                                <span>{userName}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-700 text-sm">
                                            {new Date(r.reportDate).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700 text-sm max-w-xs truncate" title={r.workDone}>{r.workDone}</td>
                                        <td className="py-3 px-4 text-center bg-blue-50 border-x border-blue-100 font-bold text-blue-700">{r.actualAmount || 0}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${r.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' : r.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                                                {r.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <Link to={`/admin/work-report/edit/${r.id}`} className="text-blue-600 hover:underline mr-3 font-medium">Duyệt</Link>
                                            <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:underline">Xóa</button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="7" className="text-center py-12 text-gray-400">Chưa có dữ liệu.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}