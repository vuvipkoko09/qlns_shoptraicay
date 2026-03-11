import { useEffect, useState } from "react";
import WorkReportAPI from "../../services/WorkReportService";
import UserAPI from "../../services/UserService";
import { Link } from "react-router-dom";

export default function WorkReportList() {
    const [items, setItems] = useState([]);
    const [users, setUsers] = useState([]);
    
    // 1. Thêm State để lưu Ca đang chọn (Mặc định là xem Tất cả)
    const [activeShift, setActiveShift] = useState('ALL'); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reportRes, userRes] = await Promise.all([
                    WorkReportAPI.getAll(),
                    UserAPI.getAll()
                ]);
                setItems(reportRes.data);
                setUsers(userRes.data);
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa báo cáo này?")) {
            try {
                await WorkReportAPI.delete(id);
                const res = await WorkReportAPI.getAll();
                setItems(res.data);
            } catch (error) {
                console.error("Lỗi xóa:", error);
            }
        }
    };

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? (user.full_name || user.fullName) : `ID: ${userId}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // --- 2. HÀM XÁC ĐỊNH CA LÀM VIỆC DỰA VÀO GIỜ ---
    const getShiftFromDate = (dateString) => {
        if (!dateString) return 'OTHER';
        const date = new Date(dateString);
        const hour = date.getHours();

        // Logic chia ca (Bạn có thể sửa giờ tùy ý)
        if (hour >= 6 && hour < 12) return 'MORNING';   // 6h - 11h59
        if (hour >= 12 && hour < 18) return 'AFTERNOON'; // 12h - 17h59
        return 'EVENING'; // 18h trở đi
    };

    // --- 3. LỌC DANH SÁCH THEO CA ĐANG CHỌN ---
    const filteredItems = items.filter(item => {
        if (activeShift === 'ALL') return true;
        return getShiftFromDate(item.reportDate) === activeShift;
    });

    // Hàm style cho nút chọn ca
    const tabClass = (shiftName) => 
        `px-4 py-2 rounded-lg font-medium transition-all ${
            activeShift === shiftName 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
        }`;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý Báo cáo</h2>
                
                <Link 
                    to="/admin/work-report/create" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow"
                >
                    <span>➕</span> Tạo báo cáo
                </Link>
            </div>

            {/* --- 4. THANH CHUYỂN ĐỔI CA (TABS) --- */}
            <div className="flex flex-wrap gap-2 mb-6 bg-gray-50 p-2 rounded-xl border border-gray-200">
                <button onClick={() => setActiveShift('ALL')} className={tabClass('ALL')}>
                    🗂️ Tất cả
                </button>
                <button onClick={() => setActiveShift('MORNING')} className={tabClass('MORNING')}>
                    🌅 Ca Sáng (6h-12h)
                </button>
                <button onClick={() => setActiveShift('AFTERNOON')} className={tabClass('AFTERNOON')}>
                    ☀️ Ca Chiều (12h-18h)
                </button>
                <button onClick={() => setActiveShift('EVENING')} className={tabClass('EVENING')}>
                    🌙 Ca Tối (18h-6h)
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 border-b text-left text-sm font-bold text-gray-700">ID</th>
                            <th className="py-3 px-4 border-b text-left text-sm font-bold text-gray-700">Thông tin</th>
                            <th className="py-3 px-4 border-b text-left text-sm font-bold text-gray-700">Thời gian & Ca</th> {/* Sửa tiêu đề */}
                            <th className="py-3 px-4 border-b text-left text-sm font-bold text-gray-700">Kết quả</th>
                            <th className="py-3 px-4 border-b text-center text-sm font-bold text-blue-700 bg-blue-50">SL Thực tế</th>
                            <th className="py-3 px-4 border-b text-center text-sm font-bold text-gray-700">Trạng thái</th>
                            <th className="py-3 px-4 border-b text-center text-sm font-bold text-gray-700">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* --- 5. Dùng filteredItems thay vì items --- */}
                        {filteredItems.length > 0 ? filteredItems.map((r) => {
                            const shift = getShiftFromDate(r.reportDate);
                            
                            return (
                                <tr key={r.id} className="hover:bg-gray-50 transition">
                                    <td className="py-3 px-4 border-b text-gray-700 font-mono text-xs">{r.id}</td>
                                    <td className="py-3 px-4 border-b text-gray-700 text-sm">
                                        <div className="font-bold text-blue-900 mb-1">
                                            {getUserName(r.userId)}
                                        </div>
                                        <div className="text-xs text-gray-500">Mã Lịch: #{r.scheduleId}</div>
                                    </td>
                                    <td className="py-3 px-4 border-b text-gray-700 text-sm">
                                        <div className="font-medium">{formatDate(r.reportDate)}</div>
                                        {/* Hiển thị Badge Ca làm việc */}
                                        <div className="mt-1">
                                            {shift === 'MORNING' && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">🌅 Sáng</span>}
                                            {shift === 'AFTERNOON' && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">☀️ Chiều</span>}
                                            {shift === 'EVENING' && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">🌙 Tối</span>}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 border-b text-gray-700 text-sm max-w-xs">
                                        <div className="line-clamp-2" title={r.workDone}>{r.workDone}</div>
                                        {r.problems && <div className="text-xs text-red-500 mt-1">⚠️ {r.problems}</div>}
                                    </td>
                                    <td className="py-3 px-4 border-b text-center bg-blue-50">
                                        <span className="font-bold text-lg text-blue-800">{r.actualAmount || 0}</span>
                                    </td>
                                    <td className="py-3 px-4 border-b text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(r.status)}`}>
                                            {r.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b text-center">
                                        <div className="flex justify-center gap-2">
                                            <Link to={`/admin/work-report/edit/${r.id}`} className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200">
                                                ✏️
                                            </Link>
                                            <button onClick={() => handleDelete(r.id)} className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="7" className="text-center py-8 text-gray-500 italic">Không tìm thấy báo cáo nào trong ca này</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}