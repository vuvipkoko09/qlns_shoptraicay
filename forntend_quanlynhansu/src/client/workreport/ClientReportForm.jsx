import React from 'react';

// Make sure 'schedules' is in the props list
export default function ClientReportForm({ title, data, setData, onSubmit, userName, schedules }) {

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">{title}</h2>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nhân viên báo cáo</label>
                <input
                    type="text"
                    value={userName || ''}
                    disabled
                    className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">

                {/* THIS IS THE CRITICAL FIX */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Ca/Lịch làm việc</label>
                    <select
                        className="w-full border p-2 rounded"
                        value={data.scheduleId}
                        onChange={(e) => setData({ ...data, scheduleId: e.target.value })}
                        required
                    >
                        <option value="">-- Chọn lịch làm việc --</option>

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
                {/* END OF FIX */}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày báo cáo</label>
                    <input
                        type="date"
                        required
                        className="w-full border p-2 rounded"
                        value={data.reportDate}
                        onChange={(e) => setData({ ...data, reportDate: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Công việc đã làm</label>
                    <textarea
                        required
                        className="w-full border p-2 rounded h-24"
                        value={data.workDone}
                        onChange={(e) => setData({ ...data, workDone: e.target.value })}
                        placeholder="Mô tả chi tiết công việc..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng thực tế (KPI)</label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded"
                            value={data.actualAmount}
                            onChange={(e) => setData({ ...data, actualAmount: e.target.value })}
                            placeholder="VD: 50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vấn đề phát sinh</label>
                    <textarea
                        className="w-full border p-2 rounded h-20"
                        value={data.problems}
                        onChange={(e) => setData({ ...data, problems: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                    <textarea
                        className="w-full border p-2 rounded h-20"
                        value={data.notes}
                        onChange={(e) => setData({ ...data, notes: e.target.value })}
                    />
                </div>

                <div className="flex gap-4 pt-2">
                    <button
                        type="submit"
                        className="w-2/3 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition"
                    >
                        💾 Gửi Báo Cáo
                    </button>
                </div>
            </form>
        </div>
    );
}