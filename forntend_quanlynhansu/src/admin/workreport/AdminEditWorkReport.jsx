import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminReportForm from './AdminReportForm';
import WorkReportAPI from "../../services/WorkReportService"; 
import UserAPI from "../../services/UserService";
import WorkScheduleAPI from "../../services/WorkScheduleService";

export default function AdminEditWorkReport() {
    const { id } = useParams();
    const navigate = useNavigate();

    // State lưu dữ liệu form
    const [reportData, setReportData] = useState({
        userId: '',      
        scheduleId: '',  
        reportDate: '', // Lưu ở dạng yyyy-MM-dd trên giao diện
        actualAmount: '',
        workDone: '',
        problems: '',
        notes: '',
        status: 'PENDING'
    });

    const [users, setUsers] = useState([]);
    const [allSchedules, setAllSchedules] = useState([]); 
    const [filteredSchedules, setFilteredSchedules] = useState([]); 
    const [loading, setLoading] = useState(true);

    // 1. Tải dữ liệu ban đầu
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reportRes, usersRes, schedulesRes] = await Promise.all([
                    WorkReportAPI.getById(id),
                    UserAPI.getAll(),
                    WorkScheduleAPI.getAll()
                ]);

                const rData = reportRes.data;
                const uData = usersRes.data;
                const sData = schedulesRes.data;

                // Map dữ liệu từ API vào State
                setReportData({
                    id: rData.id,
                    // Nếu API trả về object user, lấy user.id. Nếu trả về userId, lấy userId
                    userId: rData.userId || (rData.user ? rData.user.id : ''), 
                    scheduleId: rData.scheduleId || (rData.schedule ? rData.schedule.id : ''),
                    // Cắt chuỗi để lấy phần ngày hiển thị lên input type="date"
                    reportDate: rData.reportDate ? rData.reportDate.substring(0, 10) : '', 
                    actualAmount: rData.actualAmount || '',
                    workDone: rData.workDone || '',
                    problems: rData.problems || '',
                    notes: rData.notes || '',
                    status: rData.status || 'Pending'
                });

                setUsers(uData);
                setAllSchedules(sData);

                // Lọc lịch cho user hiện tại
                const currentUserId = rData.userId || (rData.user ? rData.user.id : '');
                if (currentUserId) {
                    const userScheds = sData.filter(s => 
                        (s.userId && String(s.userId) === String(currentUserId)) ||
                        (s.user && String(s.user.id) === String(currentUserId))
                    );
                    setFilteredSchedules(userScheds);
                }

                setLoading(false);
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // 2. Lọc lại lịch khi đổi nhân viên
    useEffect(() => {
        if (reportData.userId && allSchedules.length > 0) {
            const userScheds = allSchedules.filter(s => 
                (s.userId && String(s.userId) === String(reportData.userId)) ||
                (s.user && String(s.user.id) === String(reportData.userId))
            );
            setFilteredSchedules(userScheds);
        }
    }, [reportData.userId, allSchedules]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        // 2. SỬA: Ép kiểu dữ liệu chuẩn Java
        const payload = {
            id: Number(id), // ID phải là số
            userId: Number(reportData.userId), // Ép thành số
            scheduleId: Number(reportData.scheduleId), // Ép thành số
            actualAmount: Number(reportData.actualAmount) || 0, // Nếu rỗng thì gửi 0
            
            workDone: reportData.workDone,
            problems: reportData.problems, // Đã có trường này
            notes: reportData.notes,
            status: reportData.status,
            
            // 3. SỬA: Format ngày chuẩn ISO 8601 (2025-12-28T00:00:00.000Z)
            // Nếu có chọn ngày thì convert, không thì lấy ngày hiện tại
            reportDate: reportData.reportDate 
                ? new Date(reportData.reportDate).toISOString() 
                : new Date().toISOString()
        };

        console.log("🔥 Admin Payload:", payload); // Log để kiểm tra

        try {
            await WorkReportAPI.update(id, payload);
            alert("Cập nhật báo cáo thành công!");
            navigate('/admin/work-report');
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            const msg = error.response?.data?.message || "Kiểm tra lại dữ liệu nhập";
            alert("Lỗi server: " + msg);
        }
    };

    if (loading) return <div>Đang tải...</div>;

    return (
        <AdminReportForm
            title={`Chỉnh Sửa Báo Cáo #${id}`}
            data={reportData}
            setData={setReportData}
            onSubmit={handleSubmit}
            users={users}
            schedules={filteredSchedules}
        />
    );
}