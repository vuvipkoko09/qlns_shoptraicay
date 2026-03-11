import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function StaffListView({ users, schedules, currentDate, setCurrentDate }) {
    
    // Hàm format ngày chuẩn Local (YYYY-MM-DD) để tránh lệch múi giờ
    const getLocalDateString = (dateInput) => {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Ngày đang chọn để xem trạng thái
    const selectedDateStr = getLocalDateString(currentDate);

    const getStaffStatus = (userId) => {
        const todaySchedules = schedules.filter(s => {
            if (!s.startTime) return false;
            // So sánh chuỗi ngày Local
            const scheduleDate = getLocalDateString(s.startTime);
            return (String(s.userId) === String(userId) || (s.user && String(s.user.id) === String(userId))) 
                && scheduleDate === selectedDateStr;
        });
        return { hasSchedule: todaySchedules.length > 0, count: todaySchedules.length, tasks: todaySchedules };
    };

    // --- CẬP NHẬT LOGIC CA MỚI ---
    const getShift = (dateString) => {
        const h = new Date(dateString).getHours();
        // 1h - 12h: Sáng
        if (h >= 1 && h < 12) return 'Sáng';
        // 12h - 18h: Chiều
        if (h >= 12 && h < 18) return 'Chiều';
        // 18h - 0h: Tối (bao gồm cả 18, 19... 23 và 0)
        return 'Tối';
    };

    return (
        <div>
            {/* Bộ chọn ngày riêng cho view này */}
            <div className="flex justify-end mb-4 items-center gap-2">
                <label className="text-sm font-medium text-gray-600">Xem trạng thái ngày:</label>
                <input 
                    type="date" 
                    value={selectedDateStr}
                    onChange={(e) => setCurrentDate(new Date(e.target.value))}
                    className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => {
                    if (!user) return null;
                    const status = getStaffStatus(user.id);
                    
                    // --- XỬ LÝ LINK ẢNH ---
                    const displayName = user.fullName || user.username || "User";
                    const avatarSrc = user.fileName 
                        ? `http://localhost:8080/images/users/${user.fileName}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=128`;

                    return (
                        <div key={user.id} className={`border rounded-xl p-5 transition hover:shadow-md ${status.hasSchedule ? 'bg-white border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    {/* --- AVATAR IMAGE --- */}
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shadow-sm shrink-0 bg-gray-100">
                                        <img 
                                            src={avatarSrc} 
                                            alt={user.username} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=128`;
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-lg text-gray-800 truncate" title={user.fullName}>
                                            {displayName}
                                        </h3>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                
                                {/* Trạng thái có lịch hay không */}
                                {status.hasSchedule ? (
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                                        <FaCheckCircle /> Có lịch
                                    </span>
                                ) : (
                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                                        <FaExclamationCircle /> Trống
                                    </span>
                                )}
                            </div>
                            
                            <div className="mb-4 min-h-[60px]">
                                {status.hasSchedule ? (
                                    <div className="text-sm text-gray-600">
                                        Đang có <span className="font-bold text-blue-600">{status.count}</span> nhiệm vụ.
                                        <ul className="mt-2 space-y-1">
                                            {status.tasks.slice(0, 2).map(t => (
                                                <li key={t.id} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded truncate">
                                                    • {t.title} ({getShift(t.startTime)})
                                                </li>
                                            ))}
                                            {status.count > 2 && <li className="text-xs text-gray-400 italic">+ {status.count - 2} việc khác...</li>}
                                        </ul>
                                    </div>
                                ) : <p className="text-sm text-gray-500 italic flex items-center h-full">Nhân viên này đang rảnh rỗi.</p>}
                            </div>

                            <div className="pt-4 border-t flex gap-2">
                                <Link to={`/admin/workschedule/staff/${user.id}?date=${selectedDateStr}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg text-sm font-bold transition">Quản lý lịch</Link>
                                <Link to={`/admin/workschedule/create?userId=${user.id}&date=${selectedDateStr}`} className="w-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xl font-bold transition" title="Giao việc nhanh">+</Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}