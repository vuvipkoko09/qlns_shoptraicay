import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import WorkReportAPI from "../../services/WorkReportService";
import UserAPI from "../../services/UserService";
import WorkScheduleAPI from "../../services/WorkScheduleService";
import AdminReportForm from "./AdminReportForm"; // Đảm bảo import đúng file Form Admin

export default function CreateReportForStaff() {
    const [searchParams] = useSearchParams();
    const nav = useNavigate();

    const initialScheduleId = searchParams.get("scheduleId") || "";
    const initialUserId = searchParams.get("userId") || "";

    const [usersList, setUsersList] = useState([]);
    const [allSchedules, setAllSchedules] = useState([]);
    const [userSchedules, setUserSchedules] = useState([]);

    const [data, setData] = useState({
        userId: initialUserId,
        scheduleId: initialScheduleId,
        reportDate: new Date().toISOString().split('T')[0],
        workDone: "",
        actualAmount: "",
        problems: "",
        notes: "",
        status: "Approved"
    });

    // 1. Load dữ liệu ban đầu
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [userRes, scheduleRes] = await Promise.all([
                    UserAPI.getAll(),
                    WorkScheduleAPI.getAll()
                ]);

                // Lọc user (trừ admin)
                const staffList = userRes.data.filter(u => u.role !== 'ROLE_ADMIN');
                setUsersList(staffList);

                // Lưu toàn bộ lịch
                setAllSchedules(scheduleRes.data);
                console.log("Đã tải xong lịch trình:", scheduleRes.data); // Debug log

            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            }
        };
        loadInitialData();
    }, []);
    useEffect(() => {
        if (data.userId && allSchedules.length > 0) {
            console.log("Đang lọc lịch cho User ID:", data.userId);
            const filtered = allSchedules.filter(s =>
                String(s.userId) === String(data.userId) ||
                (s.user && String(s.user.id) === String(data.userId))
            );

            console.log("Kết quả lọc:", filtered);
            setUserSchedules(filtered);
        } else {
            setUserSchedules([]);
        }
    }, [data.userId, allSchedules]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...data,
            userId: Number(data.userId),
            scheduleId: Number(data.scheduleId),
            actualAmount: Number(data.actualAmount),
            reportDate: new Date(data.reportDate).toISOString()
        };
        try {
            await WorkReportService.create(payload);
            alert("Thành công!");
        } catch (error) {
            console.error(error);
            alert("Lỗi: " + (error.response?.data?.message || "Kiểm tra lại dữ liệu"));
        }
    };

    return (
        <AdminReportForm
            title="Admin: Tạo Hộ Báo Cáo"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            users={usersList}
            schedules={userSchedules}
        />
    );
}