import React, { useEffect, useState } from 'react';
import WorkReportService from "../../services/WorkReportService";
import { useAuth } from "../../context/AuthContext";
import { FaCheckCircle, FaTimesCircle, FaClock, FaHistory, FaSearch } from 'react-icons/fa';

export default function WorkReportHistory() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await WorkReportService.getAll();
                
                // Lọc báo cáo của chính nhân viên đang đăng nhập
                const myReports = res.data
                    .filter(r => r.userId == user.userId || r.user?.id == user.userId)
                    .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate)); // Sắp xếp mới nhất lên đầu

                setReports(myReports);
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    // --- LOGIC THỐNG KÊ ---
    const stats = {
        total: reports.length,
        approved: reports.filter(r => r.status === 'Approved').length,
        rejected: reports.filter(r => r.status === 'Rejected').length,
        pending: reports.filter(r => !r.status || r.status === 'Pending').length
    };

    // --- LỌC HIỂN THỊ ---
    const filteredReports = reports.filter(r => {
        if (filterStatus === 'ALL') return true;
        const status = r.status || 'Pending';
        return status === filterStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': 
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200"><FaCheckCircle/> Đã duyệt</span>;
            case 'Rejected': 
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200"><FaTimesCircle/> Từ chối</span>;
            default: 
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200"><FaClock/> Chờ duyệt</span>;
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl text-2xl">
                    <FaHistory />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Lịch Sử Báo Cáo</h1>
                    <p className="text-sm text-gray-500">Theo dõi kết quả công việc đã thực hiện</p>
                </div>
            </div>

            {/* --- 1. CARDS THỐNG KÊ --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase">Tổng báo cáo</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase">Đã duyệt</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase">Chờ duyệt</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase">Từ chối</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
                </div>
            </div>

            {/* --- 2. THANH LỌC TRẠNG THÁI --- */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {['ALL', 'Approved', 'Pending', 'Rejected'].map(status => (
                    <button 
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap
                            ${filterStatus === status 
                                ? 'bg-emerald-600 text-white shadow' 
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                    >
                        {status === 'ALL' ? 'Tất cả' : status === 'Approved' ? 'Đã duyệt' : status === 'Rejected' ? 'Từ chối' : 'Chờ duyệt'}
                    </button>
                ))}
            </div>

            {/* --- 3. DANH SÁCH BÁO CÁO --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredReports.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {filteredReports.map(item => (
                            <div key={item.id} className="p-5 hover:bg-gray-50 transition flex flex-col md:flex-row gap-4 items-start md:items-center">
                                {/* Cột Thời gian */}
                                <div className="md:w-32 flex-shrink-0">
                                    <div className="text-sm font-bold text-gray-800">
                                        {new Date(item.reportDate).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(item.reportDate).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                                    </div>
                                </div>

                                {/* Cột Nội dung */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 rounded">#{item.id}</span>
                                        {getStatusBadge(item.status)}
                                    </div>
                                    <p className="text-gray-800 font-medium line-clamp-2">{item.workDone}</p>
                                    
                                    {/* Chi tiết phụ */}
                                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                        {item.actualAmount && (
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-100">
                                                SL: {item.actualAmount}
                                            </span>
                                        )}
                                        {item.problems && (
                                            <span className="text-red-500 flex items-center gap-1">
                                                ⚠️ Có sự cố: {item.problems}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Cột Phản hồi của Admin (nếu có) */}
                                {item.notes && (
                                    <div className="md:w-1/3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm italic text-gray-600">
                                        " {item.notes} "
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="text-gray-500">Không tìm thấy báo cáo nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
}