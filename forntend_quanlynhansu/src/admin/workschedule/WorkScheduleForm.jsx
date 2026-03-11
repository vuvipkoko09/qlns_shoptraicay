import React, { useState, useEffect } from 'react';

export default function WorkScheduleForm({
    data,
    setData,
    onSubmit,
    title,
    users = [],
    selectedIds = [],
    setSelectedIds
}) {
    const [errorMsg, setErrorMsg] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // --- XỬ LÝ TÁCH NGÀY VÀ GIỜ AN TOÀN ---
    // Chỉ lấy ngày nếu chuỗi hợp lệ (có chữ T)
    const currentDateVal = (data.startTime && data.startTime.includes('T'))
        ? data.startTime.split('T')[0]
        : "";

    // Lấy giờ (cắt 5 ký tự đầu tiên HH:mm)
    // Nếu chưa có, để rỗng để người dùng tự chọn chứ không ép về 07:00
    const currentTimeStart = (data.startTime && data.startTime.includes('T'))
        ? data.startTime.split('T')[1].substring(0, 5)
        : "";

    const currentTimeEnd = (data.endTime && data.endTime.includes('T'))
        ? data.endTime.split('T')[1].substring(0, 5)
        : "";

    // Hàm tạo danh sách giờ (00:00 -> 23:30)
    const generateTimeOptions = () => {
        const options = [];
        for (let i = 0; i < 24; i++) {
            const hour = String(i).padStart(2, '0');
            options.push(`${hour}:00`);
            options.push(`${hour}:30`);
        }
        return options;
    };
    const timeOptions = generateTimeOptions();

    // --- LOGIC XỬ LÝ KHI CHỌN NGÀY ---
    const handleDateChange = (e) => {
        const newDate = e.target.value;
        if (!newDate) return;

        // Nếu chưa chọn giờ thì mặc định lấy 07:00 và 11:00, nếu có rồi thì giữ nguyên
        const timeS = currentTimeStart || "07:00";
        const timeE = currentTimeEnd || "11:00";

        setData({
            ...data,
            // QUAN TRỌNG: Luôn thêm :00 vào cuối
            startTime: `${newDate}T${timeS}:00`,
            endTime: `${newDate}T${timeE}:00`
        });
        setErrorMsg("");
    };

    // --- LOGIC XỬ LÝ KHI CHỌN GIỜ ---
    const handleTimeChange = (e, type) => {
        const newTime = e.target.value; // Ví dụ: "08:30"

        // Nếu chưa chọn ngày thì bắt buộc phải chọn ngày trước (hoặc lấy ngày hôm nay)
        let dateBase = currentDateVal;
        if (!dateBase) {
            const now = new Date();
            dateBase = now.toISOString().split('T')[0]; // Lấy tạm ngày hôm nay
        }

        if (type === 'start') {
            setData({ ...data, startTime: `${dateBase}T${newTime}:00` });
        } else {
            setData({ ...data, endTime: `${dateBase}T${newTime}:00` });
        }
        setErrorMsg("");
    };

    // --- CÁC HÀM KHÁC GIỮ NGUYÊN ---
    const removeAccents = (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
    };
    const filteredUsers = users.filter(u => {
        if (!searchTerm) return true;
        const name = u.full_name || u.fullName || u.username || "";
        return removeAccents(name).includes(removeAccents(searchTerm));
    });

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Validate giờ kết thúc > giờ bắt đầu
        if (data.startTime && data.endTime) {
            // So sánh chuỗi trực tiếp cũng được vì định dạng ISO chuẩn
            if (data.endTime <= data.startTime) {
                setErrorMsg("⚠️ Giờ kết thúc phải sau giờ bắt đầu!");
                return;
            }
        }
        onSubmit(e);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const handleCheckboxChange = (userId) => {
        if (selectedIds.includes(userId)) {
            setSelectedIds(selectedIds.filter(id => id !== userId));
        } else {
            setSelectedIds([...selectedIds, userId]);
        }
    };

    const handleSelectAll = () => {
        const visibleIds = filteredUsers.map(u => u.id);
        const isAllVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
        if (isAllVisibleSelected) {
            setSelectedIds(selectedIds.filter(id => !visibleIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedIds, ...visibleIds])];
            setSelectedIds(newSelected);
        }
    };
    const isAllSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedIds.includes(u.id));

    // Giới hạn ngày chọn
    const now = new Date();
    const minDateStr = now.toISOString().split('T')[0];
    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">{title}</h2>

            <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* --- PHẦN CHỌN NHÂN VIÊN (GIỮ NGUYÊN) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nhân viên ({selectedIds.length})
                        </label>
                        <div className="mb-2">
                            <input
                                type="text"
                                placeholder="Tìm tên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none"
                            />
                        </div>
                        <div className="border border-gray-300 rounded p-2 h-48 overflow-y-auto bg-gray-50">
                            {filteredUsers.length > 0 && (
                                <div className="flex items-center mb-2 pb-2 border-b border-gray-200">
                                    <input type="checkbox" className="mr-2" checked={isAllSelected} onChange={handleSelectAll} />
                                    <span className="text-sm font-bold text-blue-600 cursor-pointer" onClick={handleSelectAll}>
                                        {isAllSelected ? "Bỏ chọn" : "Chọn tất cả"}
                                    </span>
                                </div>
                            )}
                            {filteredUsers.map(u => (
                                <div key={u.id} className="flex items-center mb-2 hover:bg-white p-1 rounded">
                                    <input
                                        type="checkbox"
                                        id={`user-${u.id}`}
                                        checked={selectedIds.includes(u.id)}
                                        onChange={() => handleCheckboxChange(u.id)}
                                        className="mr-2 h-4 w-4"
                                    />
                                    <label htmlFor={`user-${u.id}`} className="text-sm text-gray-700 cursor-pointer w-full">
                                        {u.full_name || u.fullName || u.username}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {selectedIds.length === 0 && <p className="text-xs text-red-500 mt-1">* Chọn ít nhất 1 người</p>}
                    </div>

                    {/* --- PHẦN TIÊU ĐỀ VÀ NGÀY GIỜ (QUAN TRỌNG) --- */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề công việc</label>
                        <input
                            type="text"
                            name="title"
                            value={data.title || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 outline-none mb-4 focus:border-blue-500"
                            placeholder="VD: Soạn hàng..."
                            required
                        />

                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <div className="mb-3">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày thực hiện</label>
                                <input
                                    type="date"
                                    value={currentDateVal}
                                    onChange={handleDateChange}
                                    min={minDateStr}
                                    className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giờ bắt đầu</label>
                                    <select
                                        value={currentTimeStart}
                                        onChange={(e) => handleTimeChange(e, 'start')}
                                        className="w-full border border-gray-300 rounded px-3 py-2 outline-none bg-white focus:border-blue-500"
                                        required
                                    >
                                        <option value="">-- Chọn --</option>
                                        {timeOptions.map((time) => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giờ kết thúc</label>
                                    <select
                                        value={currentTimeEnd}
                                        onChange={(e) => handleTimeChange(e, 'end')}
                                        className="w-full border border-gray-300 rounded px-3 py-2 outline-none bg-white focus:border-blue-500"
                                        required
                                    >
                                        <option value="">-- Chọn --</option>
                                        {timeOptions.map((time) => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-blue-800 mb-1">Số lượng (Target)</label>
                        <input
                            type="number"
                            name="targetAmount"
                            value={data.targetAmount || ""}
                            onChange={handleChange}
                            className="w-full border border-blue-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 font-semibold"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-blue-800 mb-1">Đơn vị tính</label>
                        <select
                            name="unit"
                            value={data.unit || ""}
                            onChange={handleChange}
                            className="w-full border border-blue-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        >
                            <option value="">-- Chọn --</option>
                            <option value="kg">Kilogram (kg)</option>
                            <option value="thùng">Thùng</option>
                            <option value="giỏ">Giỏ quà</option>
                            <option value="khay">Khay</option>
                            <option value="trái">Trái/Quả</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú hướng dẫn</label>
                    <textarea
                        name="notes"
                        value={data.notes || ""}
                        onChange={handleChange}
                        rows="3"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    ></textarea>
                </div>
                {errorMsg && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm font-bold animate-pulse">
                        {errorMsg}
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={selectedIds.length === 0}
                        className={`w-full text-white font-bold py-3 px-4 rounded shadow transition
                            ${selectedIds.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                        `}
                    >
                        {selectedIds.length > 1
                            ? `Giao việc cho ${selectedIds.length} nhân viên`
                            : "Lưu Công Việc"}
                    </button>
                </div>
            </form>
        </div>
    );
}