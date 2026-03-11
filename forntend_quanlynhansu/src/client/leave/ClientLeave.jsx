import React, { useState, useEffect } from 'react';
import LeaveService from '../../services/LeaveService';
import { useAuth } from '../../context/AuthContext'; // Nhớ dùng useAuth thay vì useContext

export default function ClientLeave() {
    const { user } = useAuth(); // Lấy user từ context
    
    const [leaves, setLeaves] = useState([]);
    const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });

    // 1. Load lịch sử nghỉ phép (Chỉ chạy khi đã có User ID)
    useEffect(() => {
        if (user && (user.id || user.userId)) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        // Lấy ID chuẩn (bắt cả trường hợp id hoặc userId)
        const currentUserId = user.id || user.userId;
        try {
            const res = await LeaveService.getMyHistory(currentUserId);
            setLeaves(res.data);
        } catch (e) { console.error("Lỗi tải lịch sử nghỉ:", e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 2. FIX LỖI undefined: Lấy ID trước khi gọi API
        const currentUserId = user?.id || user?.userId;

        if (!currentUserId) {
            alert("Lỗi: Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại!");
            return;
        }

        try {
            // Truyền ID chuẩn vào hàm create
            await LeaveService.create(currentUserId, form);
            
            alert("Đã gửi đơn thành công!");
            setForm({ startDate: "", endDate: "", reason: "" }); // Reset form
            loadData(); // Tải lại danh sách
        } catch (e) { 
            console.error(e);
            alert("Lỗi gửi đơn: " + (e.response?.data?.message || "Vui lòng thử lại")); 
        }
    };

    if (!user) return <div className="p-6">Đang tải thông tin...</div>;

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Gửi Đơn */}
            <div className="bg-white p-6 rounded-lg shadow h-fit border border-blue-100">
                <h2 className="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
                    📝 Soạn Đơn Xin Nghỉ
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                        <input type="date" required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                        <input type="date" required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lý do nghỉ</label>
                        <textarea required className="w-full border p-2 rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="VD: Nhà có việc bận, đi khám bệnh..."
                            value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition shadow-md">
                        GỬI ĐƠN
                    </button>
                </form>
            </div>

            {/* Danh sách đơn */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">📂 Lịch Sử Đơn Từ</h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {leaves.map(l => (
                        <div key={l.id} className="border p-4 rounded hover:bg-gray-50 transition relative">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-800 text-sm">
                                    {l.startDate} ➔ {l.endDate}
                                </span>
                                <span className={`text-xs font-bold px-2 py-1 rounded 
                                    ${l.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                                      l.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {l.status === 'PENDING' ? 'Chờ duyệt' : l.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1 italic">"{l.reason}"</p>
                            
                            {/* Hiển thị phản hồi của Admin nếu có */}
                            {l.adminComment && (
                                <div className="mt-2 bg-red-50 p-2 rounded text-xs text-red-600 border border-red-100">
                                    <b>Admin phản hồi:</b> {l.adminComment}
                                </div>
                            )}
                        </div>
                    ))}
                    {leaves.length === 0 && <p className="text-gray-400 text-center italic mt-10">Bạn chưa gửi đơn xin nghỉ nào.</p>}
                </div>
            </div>
        </div>
    );
}