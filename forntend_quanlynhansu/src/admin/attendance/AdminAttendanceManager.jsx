import React, { useState, useEffect } from 'react';
import AttendanceService from '../../services/AttendanceService';
import UserAPI from '../../services/UserService';

export default function AdminAttendanceManager() {
    // --- STATE ---
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');

    // Mặc định lấy tháng/năm hiện tại
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(false);

    // State thống kê
    const [stats, setStats] = useState({
        totalDays: 0,
        totalLateMinutes: 0,
        totalEarlyMinutes: 0,
        lateCount: 0
    });

    // 1. Load danh sách nhân viên khi vào trang
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await UserAPI.getAll();
            setUsers(res.data);
        } catch (error) {
            console.error("Lỗi tải nhân viên:", error);
        }
    };

    // 2. Hàm tìm kiếm chấm công
    const handleSearch = async () => {
        if (!selectedUserId) {
            alert("Vui lòng chọn nhân viên cần xem!");
            return;
        }

        setLoading(true);
        try {
            // Gọi API getHistory từ service bạn cung cấp
            const res = await AttendanceService.getHistory(selectedUserId, month, year);
            const data = res.data || [];

            setAttendanceList(data);
            calculateStats(data);
        } catch (error) {
            console.error("Lỗi tải dữ liệu chấm công:", error);
            alert("Không thể tải dữ liệu chấm công.");
            setAttendanceList([]);
        } finally {
            setLoading(false);
        }
    };

    // 3. Tính toán thống kê
    const calculateStats = (data) => {
        let lateMins = 0;
        let earlyMins = 0;
        let lateCnt = 0;

        data.forEach(att => {
            lateMins += (att.lateMinutes || 0);
            earlyMins += (att.earlyLeaveMinutes || 0);
            if (att.status === 'LATE') lateCnt++;
        });

        setStats({
            totalDays: data.length, // Số bản ghi (lưu ý: nếu 1 ngày làm 2 ca thì số này > số ngày thực tế)
            totalLateMinutes: lateMins,
            totalEarlyMinutes: earlyMins,
            lateCount: lateCnt
        });
    };

    // --- HELPER FORMAT ---
    const formatTime = (isoString) => {
        if (!isoString) return <span className="text-gray-400 italic">--:--</span>;
        return new Date(isoString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoDate) => {
        if (!isoDate) return "";
        // date trong DB là LocalDate (yyyy-MM-dd)
        const [y, m, d] = isoDate.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                📅 Quản Lý Chấm Công
            </h2>

            {/* --- THANH CÔNG CỤ TÌM KIẾM --- */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nhân viên:</label>
                    <select
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                        <option value="">-- Chọn nhân viên --</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.fullName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="w-24">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tháng:</label>
                    <input
                        type="number" min="1" max="12"
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={month} onChange={(e) => setMonth(e.target.value)}
                    />
                </div>

                <div className="w-32">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Năm:</label>
                    <input
                        type="number"
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={year} onChange={(e) => setYear(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition shadow h-[42px] min-w-[100px]"
                >
                    {loading ? "Đang tải..." : "Xem"}
                </button>
            </div>

            {/* --- KẾT QUẢ --- */}
            {attendanceList.length > 0 ? (
                <div className="animate-fade-in">
                    {/* Thẻ Thống kê nhanh */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                            <p className="text-gray-500 text-xs uppercase font-bold">Tổng lượt chấm công</p>
                            <p className="text-2xl font-bold text-blue-700">{stats.totalDays} <span className="text-sm font-normal text-gray-400">lượt</span></p>
                        </div>
                        <div className="bg-white p-4 rounded shadow border-l-4 border-red-500">
                            <p className="text-gray-500 text-xs uppercase font-bold">Số lần đi muộn</p>
                            <p className="text-2xl font-bold text-red-600">{stats.lateCount} <span className="text-sm font-normal text-gray-400">lần</span></p>
                        </div>
                        <div className="bg-white p-4 rounded shadow border-l-4 border-orange-500">
                            <p className="text-gray-500 text-xs uppercase font-bold">Tổng phút đi muộn</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.totalLateMinutes} <span className="text-sm font-normal text-gray-400">phút</span></p>
                        </div>
                        <div className="bg-white p-4 rounded shadow border-l-4 border-yellow-500">
                            <p className="text-gray-500 text-xs uppercase font-bold">Tổng phút về sớm</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.totalEarlyMinutes} <span className="text-sm font-normal text-gray-400">phút</span></p>
                        </div>
                    </div>

                    {/* Bảng Dữ liệu */}
                    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3 border-b">Ngày</th>
                                    <th className="px-4 py-3 border-b">Ca làm việc</th>
                                    <th className="px-4 py-3 border-b text-center">Giờ vào</th>
                                    <th className="px-4 py-3 border-b text-center">Giờ ra</th>
                                    <th className="px-4 py-3 border-b text-center">Trạng thái</th>
                                    <th className="px-4 py-3 border-b text-center">Phạt (Phút)</th>
                                    <th className="px-4 py-3 border-b">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {attendanceList.map((att) => (
                                    <tr key={att.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {formatDate(att.date)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {/* SỬA ĐOẠN NÀY: Dùng att.scheduleTitle thay vì att.schedule.title */}
                                            {att.scheduleTitle ? (
                                                <div className="flex flex-col">
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100 font-bold mb-1">
                                                        {att.scheduleTitle}
                                                    </span>
                                                    {/* Hiển thị thêm giờ quy định cho chuyên nghiệp */}
                                                    <span className="text-[10px] text-gray-400">
                                                        ({att.scheduleStartTime?.substring(0, 5)} - {att.scheduleEndTime?.substring(0, 5)})
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Ngoài giờ / Không lịch</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-blue-700">
                                            {formatTime(att.checkInTime)}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-purple-700">
                                            {formatTime(att.checkOutTime)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${att.status === 'LATE' ? 'bg-red-100 text-red-700 border-red-200' :
                                                    att.status === 'EARLY_LEAVE' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                        'bg-green-100 text-green-700 border-green-200'
                                                }`}>
                                                {att.status === 'LATE' ? 'ĐI MUỘN' :
                                                    att.status === 'EARLY_LEAVE' ? 'VỀ SỚM' : 'ĐÚNG GIỜ'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {(att.lateMinutes > 0 || att.earlyLeaveMinutes > 0) ? (
                                                <div className="flex flex-col gap-1 items-center">
                                                    {att.lateMinutes > 0 && <span className="text-red-600 text-xs">Muộn: {att.lateMinutes}p</span>}
                                                    {att.earlyLeaveMinutes > 0 && <span className="text-yellow-600 text-xs">Sớm: {att.earlyLeaveMinutes}p</span>}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={att.note}>
                                            {att.note || "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded shadow-sm border border-gray-200">
                    <p className="text-gray-400 italic">
                        {loading ? "Đang tải dữ liệu..." : "Chưa có dữ liệu chấm công nào trong khoảng thời gian này."}
                    </p>
                </div>
            )}
        </div>
    );
}