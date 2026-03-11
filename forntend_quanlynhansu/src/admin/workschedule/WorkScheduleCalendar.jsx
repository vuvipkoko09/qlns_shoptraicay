import { useEffect, useState } from "react";
import WorkReportAPI from "../../services/WorkReportService";
import UserAPI from "../../services/UserService";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function WorkReportCalendar() {
    const [items, setItems] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetchData();
    }, []);

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

    // Hàm lấy User Object
    const getUser = (userId) => {
        return users.find(u => u.id === userId);
    };

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

    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));

    const SHIFTS = [
        { id: 'MORNING', label: '🌅 Sáng', time: '1h - 12h', color: 'bg-orange-50 border-orange-100' },
        { id: 'AFTERNOON', label: '☀️ Chiều', time: '12h - 18h', color: 'bg-yellow-50 border-yellow-100' },
        { id: 'EVENING', label: '🌙 Tối', time: '18h - 0h', color: 'bg-indigo-50 border-indigo-100' }
    ];

    const getShiftFromDate = (dateString) => {
        const date = new Date(dateString);
        const hour = date.getHours();
        if (hour >= 1 && hour < 12) return 'MORNING';
        if (hour >= 12 && hour < 18) return 'AFTERNOON';
        return 'EVENING';
    };

    const isSameDate = (date1, dateStr2) => {
        const d1 = new Date(date1);
        const d2 = new Date(dateStr2);
        return d1.getDate() === d2.getDate() && 
               d1.getMonth() === d2.getMonth() && 
               d1.getFullYear() === d2.getFullYear();
    };

    const getItemsForCell = (day, shiftId) => {
        return items.filter(item => 
            isSameDate(day, item.reportDate) && 
            getShiftFromDate(item.reportDate) === shiftId
        );
    };

    const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
    const goToday = () => setCurrentDate(new Date());

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    📅 Lịch Báo Cáo Tuần
                </h2>
                
                <div className="flex items-center gap-4 bg-gray-100 p-1 rounded-lg">
                    <button onClick={prevWeek} className="p-2 hover:bg-white rounded shadow-sm transition"><FaChevronLeft/></button>
                    <span className="font-semibold px-2 min-w-[200px] text-center">
                        {startOfWeek.toLocaleDateString('vi-VN')} - {addDays(startOfWeek, 6).toLocaleDateString('vi-VN')}
                    </span>
                    <button onClick={nextWeek} className="p-2 hover:bg-white rounded shadow-sm transition"><FaChevronRight/></button>
                    <button onClick={goToday} className="text-sm text-blue-600 font-bold px-3 hover:underline">Hôm nay</button>
                </div>

                <Link to="/admin/work-report/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
                    + Thêm mới
                </Link>
            </div>

            <div className="overflow-x-auto border rounded-xl shadow-sm">
                <table className="w-full min-w-[1000px] table-fixed border-collapse">
                    <thead>
                        <tr className="bg-emerald-800 text-white">
                            <th className="w-24 p-3 border-r border-emerald-700">Ca / Thứ</th>
                            {weekDays.map((day, index) => {
                                const isToday = isSameDate(new Date(), day);
                                return (
                                    <th key={index} className={`p-3 border-r border-emerald-700 ${isToday ? 'bg-emerald-600' : ''}`}>
                                        <div className="text-xs opacity-80 uppercase">
                                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </div>
                                        <div className="text-lg font-bold">
                                            {day.getDate()}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {SHIFTS.map((shift) => (
                            <tr key={shift.id} className="border-b last:border-b-0">
                                <td className={`p-4 font-bold text-gray-700 border-r text-center ${shift.color}`}>
                                    <div className="text-lg">{shift.label}</div>
                                    <div className="text-xs font-normal text-gray-500 mt-1">{shift.time}</div>
                                </td>

                                {weekDays.map((day, idx) => {
                                    const cellData = getItemsForCell(day, shift.id);
                                    
                                    return (
                                        <td key={idx} className="p-2 border-r border-gray-100 align-top h-32 hover:bg-gray-50 transition relative">
                                            <div className="flex flex-col gap-2 h-full">
                                                {cellData.length > 0 ? cellData.map((item) => {
                                                    const user = getUser(item.userId);
                                                    const userName = user ? (user.fullName || user.username).split(' ').pop() : `User ${item.userId}`;
                                                    const userAvatar = user?.fileName 
                                                        ? `http://localhost:8080/images/users/${user.fileName}`
                                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=64`;

                                                    return (
                                                        <Link 
                                                            key={item.id}
                                                            to={`/admin/work-report/edit/${item.id}`}
                                                            className={`text-xs p-2 rounded border shadow-sm cursor-pointer hover:scale-105 transition duration-200 block group
                                                                ${item.status === 'Approved' ? 'bg-green-50 border-green-200 text-green-900' : 
                                                                  item.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-900' : 
                                                                  'bg-white border-blue-200 text-blue-900'}
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-1">
                                                                <img 
                                                                    src={userAvatar} 
                                                                    alt="Avt" 
                                                                    className="w-6 h-6 rounded-full object-cover border border-gray-300"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=64`;
                                                                    }}
                                                                />
                                                                <div className="flex-1 font-bold truncate flex justify-between items-center">
                                                                    <span>{userName}</span>
                                                                    <span className="opacity-50 text-[10px] font-normal">#{item.id}</span>
                                                                </div>
                                                            </div>

                                                            <div className="line-clamp-2 mb-1 text-gray-700" title={item.workDone}>{item.workDone}</div>
                                                            
                                                            {item.actualAmount && (
                                                                <div className="font-bold bg-white/60 px-1.5 py-0.5 rounded inline-block text-[10px] border border-gray-100">
                                                                    SL: {item.actualAmount}
                                                                </div>
                                                            )}
                                                        </Link>
                                                    );
                                                }) : (
                                                    <div className="flex-1 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                                        <Link 
                                                            to={`/admin/work-report/create`} 
                                                            className="text-2xl text-gray-300 hover:text-blue-500"
                                                        >
                                                            +
                                                        </Link>
                                                    </div>
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
        </div>
    );
}