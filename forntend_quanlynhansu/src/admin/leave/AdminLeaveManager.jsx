import React, { useState, useEffect } from 'react';
import LeaveService from '../../services/LeaveService';

export default function AdminLeaveManager() {
    const [requests, setRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    useEffect(() => { loadRequests(); }, []);

    const loadRequests = async () => {
        try {
            const res = await LeaveService.getAll();
            setRequests(res.data);
        } catch (e) { console.error(e); }
    };

    const handleApprove = async (id, status) => {
        const comment = prompt("Nhập ghi chú (nếu có):", status === 'APPROVED' ? "Duyệt" : "Từ chối");
        if (comment === null) return;
        try {
            await LeaveService.approve(id, status, comment);
            alert("Đã cập nhật!");
            loadRequests();
        } catch (e) { alert("Lỗi"); }
    };
    const filteredRequests = requests.filter(req => {
        const matchName = req.userName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter ? req.status === statusFilter : true;
        const matchDate = dateFilter ? req.startDate?.startsWith(dateFilter) : true;

        return matchName && matchStatus && matchDate;
    });
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Duyệt Đơn Nghỉ Phép</h2>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-end border border-gray-200">

                {/* Tìm tên */}
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tìm nhân viên</label>
                    <input
                        type="text"
                        placeholder="Nhập tên nhân viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {/* Lọc Trạng thái */}
                <div className="w-48">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Trạng thái</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">-- Tất cả --</option>
                        <option value="PENDING">⏳ Chờ duyệt</option>
                        <option value="APPROVED">✅ Đã duyệt</option>
                        <option value="REJECTED">❌ Từ chối</option>
                    </select>
                </div>

                {/* Lọc Tháng */}
                <div className="w-48">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Chọn tháng</label>
                    <input
                        type="month"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {/* Nút Reset (nếu cần) */}
                <button
                    onClick={() => { setSearchTerm(""); setStatusFilter(""); setDateFilter(""); }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 font-medium h-[42px]"
                >
                    Xóa lọc
                </button>
            </div>
            {/* --- BẢNG DỮ LIỆU --- */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-sm font-bold text-gray-700 uppercase">
                        <tr>
                            <th className="px-6 py-4 border-b">Nhân viên</th>
                            <th className="px-6 py-4 border-b">Thời gian</th>
                            <th className="px-6 py-4 border-b">Lý do</th>
                            <th className="px-6 py-4 border-b text-center">Trạng thái</th>
                            <th className="px-6 py-4 border-b text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredRequests.length > 0 ? (
                            // 4. SỬ DỤNG filteredRequests ĐỂ HIỂN THỊ
                            filteredRequests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-bold text-gray-800">{req.userName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex flex-col">
                                            <span>Từ: <span className="font-semibold text-gray-800">{req.startDate}</span></span>
                                            <span>Đến: <span className="font-semibold text-gray-800">{req.endDate}</span></span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 italic">"{req.reason}"</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                req.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                            {req.status === 'PENDING' ? 'Chờ duyệt' :
                                                req.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {req.status === 'PENDING' && (
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleApprove(req.id, 'APPROVED')}
                                                    className="bg-green-600 text-white px-3 py-1.5 rounded shadow hover:bg-green-700 text-xs font-bold transition transform hover:-translate-y-0.5"
                                                >
                                                    ✓ Duyệt
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(req.id, 'REJECTED')}
                                                    className="bg-red-500 text-white px-3 py-1.5 rounded shadow hover:bg-red-600 text-xs font-bold transition transform hover:-translate-y-0.5"
                                                >
                                                    ✕ Huỷ
                                                </button>
                                            </div>
                                        )}
                                        {req.status !== 'PENDING' && (
                                            <span className="text-gray-400 text-xs italic">Đã xử lý</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                                    Không tìm thấy đơn nghỉ phép nào phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}