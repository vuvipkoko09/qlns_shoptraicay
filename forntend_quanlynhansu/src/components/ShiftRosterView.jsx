import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function ShiftRosterView({ users, schedules, currentDate, setCurrentDate }) {
    
    // --- 1. XỬ LÝ NGÀY THÁNG ---
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

    const getLocalDateString = (dateInput) => {
        const d = new Date(dateInput);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));

    // --- 2. CẤU HÌNH CA ---
    const SHIFTS = [
        { id: 'MORNING', label: '🌅 SÁNG', time: '6h - 13h', color: 'bg-orange-50 text-orange-800 border-orange-100' },
        { id: 'AFTERNOON', label: '☀️ CHIỀU', time: '13h - 18h', color: 'bg-yellow-50 text-yellow-800 border-yellow-100' },
        { id: 'EVENING', label: '🌙 TỐI', time: '18h - 6h', color: 'bg-indigo-50 text-indigo-800 border-indigo-100' }
    ];

    const getShiftFromTime = (dateString) => {
        const h = new Date(dateString).getHours();
        if (h >= 6 && h < 13) return 'MORNING';
        if (h >= 13 && h < 18) return 'AFTERNOON';
        return 'EVENING';
    };

    const getTasksInShift = (day, shiftId) => {
        const dateStr = getLocalDateString(day);
        return schedules.filter(s => {
            const sDate = getLocalDateString(s.startTime);
            return sDate === dateStr && getShiftFromTime(s.startTime) === shiftId;
        });
    };

    const getStaffInfo = (userId) => {
        return users.find(u => String(u.id) === String(userId)) || {};
    };

    return (
        <div>
            {/* Header Điều hướng */}
            <div className="flex items-center justify-center gap-4 mb-4 bg-white p-3 rounded-xl border shadow-sm">
                <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="p-2 hover:bg-gray-100 rounded-lg transition"><FaChevronLeft/></button>
                <span className="font-bold text-xl text-gray-800 min-w-[250px] text-center">
                    {startOfWeek.toLocaleDateString('vi-VN')} - {addDays(startOfWeek, 6).toLocaleDateString('vi-VN')}
                </span>
                <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 hover:bg-gray-100 rounded-lg transition"><FaChevronRight/></button>
                <button onClick={() => setCurrentDate(new Date())} className="text-sm text-blue-600 font-bold hover:bg-blue-50 px-3 py-1 rounded-lg transition">Hôm nay</button>
            </div>

            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white">
                <table className="w-full min-w-[1200px] border-collapse table-fixed">
                    <thead>
                        <tr className="bg-emerald-800 text-white">
                            <th className="w-32 p-3 border-r border-emerald-700">Ca / Thứ</th>
                            {weekDays.map((day, i) => {
                                const isToday = getLocalDateString(day) === getLocalDateString(new Date());
                                return (
                                    <th key={i} className={`p-3 border-r border-emerald-700 text-center ${isToday ? 'bg-emerald-600' : ''}`}>
                                        <div className="text-xs opacity-70 uppercase tracking-widest">{day.toLocaleDateString('vi-VN', {weekday: 'short'})}</div>
                                        <div className="font-bold text-2xl">{day.getDate()}</div>
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {SHIFTS.map(shift => (
                            <tr key={shift.id} className="border-b last:border-b-0">
                                <td className={`p-4 border-r text-center align-middle ${shift.color}`}>
                                    <div className="text-3xl mb-2">{shift.label.split(' ')[0]}</div>
                                    <div className="text-lg font-black uppercase tracking-wide">{shift.label.split(' ')[1]}</div>
                                    <div className="text-xs font-bold opacity-60 mt-1 bg-white/50 py-1 rounded">{shift.time}</div>
                                </td>

                                {weekDays.map((day, idx) => {
                                    const tasks = getTasksInShift(day, shift.id);
                                    const isToday = getLocalDateString(day) === getLocalDateString(new Date());

                                    return (
                                        <td key={idx} className={`p-2 border-r border-gray-100 align-top h-40 transition relative ${isToday ? 'bg-blue-50/20' : ''}`}>
                                            <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar">
                                                
                                                {/* --- NẾU CÓ DỮ LIỆU --- */}
                                                {tasks.length > 0 ? (
                                                    <>
                                                        {tasks.map(task => {
                                                            const staff = getStaffInfo(task.userId);
                                                            const avatarSrc = staff.fileName 
                                                                ? `http://localhost:8080/images/users/${staff.fileName}`
                                                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.fullName || "User")}&background=random&color=fff&size=64`;

                                                            return (
                                                                <Link 
                                                                    key={task.id}
                                                                    to={`/admin/workschedule/edit/${task.id}`}
                                                                    className="block bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md hover:border-blue-300 transition group z-10 relative"
                                                                >
                                                                    <div className="flex items-center gap-2 mb-1.5">
                                                                        <img src={avatarSrc} alt="Avt" className="w-6 h-6 rounded-full object-cover border border-gray-100 bg-gray-100 shrink-0" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=U&background=random&color=fff`}/>
                                                                        <span className="text-xs font-bold text-gray-700 truncate flex-1">{staff.fullName ? staff.fullName.split(' ').pop() : 'User'}</span>
                                                                        {task.targetAmount && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">SL:{task.targetAmount}</span>}
                                                                    </div>
                                                                    <div className="text-[11px] text-gray-500 line-clamp-2 leading-tight pl-1 border-l-2 border-gray-100 group-hover:border-blue-400 transition-colors">{task.title}</div>
                                                                </Link>
                                                            );
                                                        })}
                                                        {/* Nút cộng nhỏ khi đã có task */}
                                                        <Link 
                                                            to={`/admin/workschedule/create?date=${getLocalDateString(day)}`}
                                                            className="w-full text-center text-xs text-gray-400 hover:text-green-600 hover:bg-green-50 rounded py-1 border border-dashed border-gray-300 mt-auto"
                                                        >
                                                            + Thêm nữa
                                                        </Link>
                                                    </>
                                                ) : (
                                                    // --- NẾU Ô TRỐNG (BIẾN CẢ Ô THÀNH LINK) ---
                                                    <Link 
                                                        to={`/admin/workschedule/create?date=${getLocalDateString(day)}`}
                                                        className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/50 rounded-lg transition group h-full"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-green-100 group-hover:text-green-600 transition mb-1">
                                                            <span className="text-xl font-bold">+</span>
                                                        </div>
                                                        <span className="text-xs text-gray-300 italic font-medium group-hover:text-green-600">Thêm mới</span>
                                                    </Link>
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
            <div className="mt-2 text-xs text-gray-400 italic text-right pr-2">
                * Kéo chuột để xem hết tuần. Bấm vào thẻ để chỉnh sửa.
            </div>
        </div>
    );
}