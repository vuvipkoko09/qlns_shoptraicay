import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminReportForm({ title, data, setData, onSubmit, users, schedules }) {

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Xử lý riêng cho status vì nó dùng radio, nhưng code của bạn đang dùng chung handleChange cũng OK
        setData({ ...data, [name]: value });
    };

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">{title}</h2>

            <form onSubmit={onSubmit} className="space-y-6">

                {/* 1. CHỌN NHÂN VIÊN & LỊCH */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Chọn Nhân viên:</label>
                        <select
                            name="userId"
                            value={data.userId}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">-- Chọn nhân viên --</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.fullName || u.username}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Chọn Công việc (Lịch):</label>
                        <select
                            name="scheduleId"
                            value={data.scheduleId}
                            onChange={handleChange}
                            required
                            disabled={!data.userId}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            <option value="">-- Chọn công việc --</option>
                            {schedules.map((s) => {
                                // --- SỬA LẠI FORMAT NGÀY GIỜ ---
                                const d = new Date(s.startTime);

                                // Ép kiểu thủ công: DD/MM/YYYY
                                const day = String(d.getDate()).padStart(2, '0');
                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                const year = d.getFullYear();

                                // Lấy giờ phút (HH:mm)
                                const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <option key={s.id} value={s.id}>
                                        {/* Hiển thị: 01/02/2026 - 07:30 */}
                                        {day}/{month}/{year} - {time}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* 2. NGÀY & SL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ngày báo cáo:</label>
                        <input
                            type="date"
                            name="reportDate"
                            value={data.reportDate}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng thực tế (SL):</label>
                        <input
                            type="number"
                            name="actualAmount"
                            value={data.actualAmount}
                            onChange={handleChange}
                            placeholder="VD: 100"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* 3. NỘI DUNG CÔNG VIỆC */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Công việc đã làm (Work Done):</label>
                    <textarea
                        name="workDone"
                        value={data.workDone}
                        onChange={handleChange}
                        required
                        rows="3"
                        placeholder="Mô tả kết quả..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                </div>

                {/* --- 4. VẤN ĐỀ GẶP PHẢI (MỚI THÊM VÀO ĐÚNG CHỖ) --- */}
                <div>
                    <label className="block text-sm font-bold text-red-700 mb-2">Vấn đề phát sinh / Khó khăn:</label>
                    <textarea
                        name="problems" // Nhớ thêm name để handleChange hoạt động
                        value={data.problems || ''} // Handle null
                        onChange={handleChange}
                        rows="2"
                        placeholder="Khó khăn, sự cố (nếu có)..."
                        className="w-full p-3 border border-red-200 bg-red-50 rounded-lg focus:ring-2 focus:ring-red-500"
                    ></textarea>
                </div>

                {/* 5. GHI CHÚ ADMIN */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú của Admin (Notes):</label>
                    <textarea
                        name="notes"
                        value={data.notes}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Nhận xét, đánh giá..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                </div>

                {/* 6. TRẠNG THÁI DUYỆT */}
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                    <label className="block text-sm font-bold text-blue-800 mb-3 uppercase tracking-wide">Trạng thái Duyệt:</label>
                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white transition select-none">
                            <input
                                type="radio"
                                name="status"
                                value="APPROVED"
                                checked={data.status === 'APPROVED'}
                                onChange={handleChange}
                                className="w-5 h-5 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-green-700 font-bold">✅ Đã Duyệt (Approved)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white transition select-none">
                            <input
                                type="radio"
                                name="status"
                                value="REJECTED"
                                checked={data.status === 'REJECTED'}
                                onChange={handleChange}
                                className="w-5 h-5 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-red-700 font-bold">❌ Từ Chối (Rejected)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white transition select-none">
                            <input
                                type="radio"
                                name="status"
                                value="PENDING"
                                checked={data.status === 'PENDING'}
                                onChange={handleChange}
                                className="w-5 h-5 text-yellow-600 focus:ring-yellow-500"
                            />
                            <span className="text-yellow-700 font-bold">⏳ Chờ Duyệt (Pending)</span>
                        </label>
                    </div>
                </div>

                {/* --- BUTTONS --- */}
                <div className="flex gap-4 pt-4 border-t">
                    <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition transform hover:-translate-y-0.5"
                    >
                        💾 Lưu Cập Nhật
                    </button>
                    <Link
                        to="/admin/work-report"
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg transition"
                    >
                        Hủy
                    </Link>
                </div>
            </form>
        </div>
    );
}