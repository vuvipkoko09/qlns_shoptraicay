import { useEffect, useState } from "react";
import WorkScheduleService from "../../services/WorkScheduleService"; 
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function WorkScheduleCalendar() {
    const { user } = useAuth(); // Lấy thông tin user đang đăng nhập
    const [items, setItems] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchMySchedules = async () => {
            try {
                // Giả sử API trả về list tất cả, ta lọc phía client (Hoặc gọi API findByUserId nếu có)
                const res = await WorkScheduleService.getAll();
                // Lọc chỉ lấy việc của mình (So sánh ID)
                // Lưu ý: user.id trong context có thể là string hoặc number, nên so sánh lỏng (==) hoặc ép kiểu
                const myItems = res.data.filter(t => t.userId == user.userId || t.user?.id == user.userId);
                setItems(myItems);
            } catch (error) {
                console.error("Lỗi tải lịch:", error);
            }
        };
        fetchMySchedules();
    }, [user]);
    const getShiftFromDate = (dateString) => {
        const date = new Date(dateString);
        const hour = date.getHours();
        if (hour >= 6 && hour < 12) return 'MORNING';
        if (hour >= 12 && hour < 18) return 'AFTERNOON';
        return 'EVENING';
    };

    // Hàm lấy ngày đầu tuần (Copy lại)
    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay(); 
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };
    const addDays = (d, days) => { const n = new Date(d); n.setDate(n.getDate() + days); return n; };
    
    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
    const isSameDate = (d1, d2Str) => {
        const date2 = new Date(d2Str);
        return d1.getDate() === date2.getDate() && d1.getMonth() === date2.getMonth();
    }

    const SHIFTS = [
        { id: 'MORNING', label: '🌅 Sáng', time: '6h - 12h', color: 'bg-orange-50 border-orange-100' },
        { id: 'AFTERNOON', label: '☀️ Chiều', time: '12h - 18h', color: 'bg-yellow-50 border-yellow-100' },
        { id: 'EVENING', label: '🌙 Tối', time: '18h - 6h', color: 'bg-indigo-50 border-indigo-100' }
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm min-h-screen">
            {/* Header Lịch */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-emerald-800">📅 Lịch Làm Việc Của Tôi</h2>
                <div className="flex items-center gap-4 bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="p-2 hover:bg-white rounded"><FaChevronLeft/></button>
                    <span className="font-semibold px-2">
                        {startOfWeek.toLocaleDateString('vi-VN')} - {addDays(startOfWeek, 6).toLocaleDateString('vi-VN')}
                    </span>
                    <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 hover:bg-white rounded"><FaChevronRight/></button>
                </div>
            </div>

            {/* Bảng Lịch */}
            <div className="overflow-x-auto border rounded-xl shadow-sm">
                <table className="w-full min-w-[1000px] table-fixed border-collapse">
                    <thead>
                        <tr className="bg-emerald-700 text-white">
                            <th className="w-24 p-3 border-r border-emerald-600">Ca</th>
                            {weekDays.map((day, i) => (
                                <th key={i} className="p-3 border-r border-emerald-600">
                                    <div className="uppercase text-xs opacity-75">{day.toLocaleDateString('en-US', {weekday:'short'})}</div>
                                    <div className="text-xl font-bold">{day.getDate()}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {SHIFTS.map(shift => (
                            <tr key={shift.id} className="border-b">
                                <td className={`p-4 text-center border-r font-bold ${shift.color}`}>
                                    {shift.label}
                                </td>
                                {weekDays.map((day, idx) => {
                                    // Lọc công việc của ngày đó + ca đó
                                    const cellData = items.filter(item => 
                                        isSameDate(day, item.startTime) && 
                                        getShiftFromDate(item.startTime) === shift.id
                                    );

                                    return (
                                        <td key={idx} className="p-2 border-r h-32 align-top hover:bg-gray-50 transition">
                                            <div className="flex flex-col gap-2">
                                                {cellData.map(task => (
                                                    // --- QUAN TRỌNG: Link trỏ đến trang CHI TIẾT ---
                                                    <Link 
                                                        key={task.id}
                                                        to={`/client/workschedule/detail/${task.id}`} 
                                                        className="block p-2 bg-white border border-emerald-200 rounded shadow-sm hover:shadow-md hover:border-emerald-500 transition group"
                                                    >
                                                        <div className="font-bold text-sm text-gray-800 group-hover:text-emerald-700 truncate">{task.title}</div>
                                                        <div className="text-xs text-gray-500 flex justify-between mt-1">
                                                            <span>KPI: {task.targetAmount}</span>
                                                            <span className="text-emerald-600">Chi tiết &rarr;</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}