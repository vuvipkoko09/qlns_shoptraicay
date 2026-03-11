import React, { useEffect, useState } from 'react';
import UserAPI from "../../services/UserService";
import WorkScheduleAPI from "../../services/WorkScheduleService";
import { FaCalendarAlt, FaList } from 'react-icons/fa';

// Import 2 component con
import StaffListView from '../../components/StaffListView'; 
import ShiftRosterView from '../../components/ShiftRosterView'; 

export default function WorkScheduleOverview() {
    const [users, setUsers] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Mặc định vào xem Lịch Ca cho trực quan
    const [viewMode, setViewMode] = useState('SHIFT_ROSTER'); 
    const [currentDate, setCurrentDate] = useState(new Date()); 

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [userRes, scheduleRes] = await Promise.all([
                UserAPI.getAll(),
                WorkScheduleAPI.getAll()
            ]);
            // Lấy danh sách nhân viên (trừ Admin)
            const staffList = userRes.data.filter(u => u && u.role !== 'ROLE_ADMIN'); 
            setUsers(staffList);
            setSchedules(scheduleRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi tải dữ liệu overview:", error);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu phân công...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Quản lý Phân Công</h2>
                
                {/* Thanh chuyển đổi chế độ xem */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('SHIFT_ROSTER')}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition ${viewMode === 'SHIFT_ROSTER' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FaCalendarAlt /> Lịch Ca
                    </button>
                    <button 
                        onClick={() => setViewMode('STAFF_LIST')}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition ${viewMode === 'STAFF_LIST' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FaList /> Danh sách NV
                    </button>
                </div>
            </div>
            {viewMode === 'SHIFT_ROSTER' ? (
                <ShiftRosterView 
                    users={users} 
                    schedules={schedules} 
                    currentDate={currentDate} 
                    setCurrentDate={setCurrentDate} 
                />
            ) : (
                <StaffListView 
                    users={users} 
                    schedules={schedules} 
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate} 
                />
            )}
        </div>
    );
}