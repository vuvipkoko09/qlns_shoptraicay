import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WorkReportAPI from "../../services/WorkReportService";
import WorkScheduleAPI from "../../services/WorkScheduleService"; // 1. Import API Lịch
import ClientReportForm from "./ClientReportForm"; // Dùng form chung với trang Create
import { useAuth } from "../../context/AuthContext";

export default function EditWorkReport() {
    const { id } = useParams();
    const { user } = useAuth(); // Lấy user hiện tại để hiển thị tên và load lịch
    const nav = useNavigate();
    
    const [data, setData] = useState({});
    const [schedules, setSchedules] = useState([]); // 2. State chứa danh sách lịch

    useEffect(() => {
        const loadData = async () => {
            // Chờ user load xong mới chạy (để có userId)
            if (!user) return;

            try {
                // 3. Gọi song song: Lấy chi tiết báo cáo VÀ Lấy danh sách lịch của user đó
                const [reportRes, scheduleRes] = await Promise.all([
                    WorkReportAPI.getById(id),
                    WorkScheduleAPI.getByUserId(user.userId) // Load lịch để đổ vào dropdown
                ]);

                const reportData = reportRes.data;
                
                // --- XỬ LÝ DỮ LIỆU ĐỂ HIỂN THỊ ĐÚNG TRÊN FORM ---
                
                // 4. Lấy ID lịch (xử lý trường hợp Backend trả về object lồng nhau)
                // Spring Boot thường trả về: reportData.workSchedule.id
                const schId = reportData.workSchedule?.id || reportData.schedule?.id || reportData.scheduleId;

                // 5. Format ngày: Cắt bỏ phần giờ (T...) để input type="date" hiểu được
                // Ví dụ: "2026-01-24T07:00:00" -> "2026-01-24"
                const formattedDate = reportData.reportDate ? reportData.reportDate.split('T')[0] : "";

                setData({
                    ...reportData,
                    scheduleId: schId,      // Gán ID lịch đã xử lý phẳng
                    reportDate: formattedDate // Gán ngày đã format
                });

                setSchedules(scheduleRes.data || []);

            } catch (error) {
                console.error("Lỗi tải dữ liệu edit:", error);
                alert("Không thể tải thông tin báo cáo!");
            }
        };

        loadData();
    }, [id, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 6. Khi lưu, cần format lại ngày giờ cho chuẩn ISO (như bên Create)
        const now = new Date();
        const selectedDate = new Date(data.reportDate);
        selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

        const payload = {
            ...data,
            scheduleId: Number(data.scheduleId), // Đảm bảo là số
            userId: user.userId,                 // Đảm bảo userId không bị mất
            actualAmount: data.actualAmount ? Number(data.actualAmount) : 0,
            reportDate: selectedDate.toISOString() // Gửi lên dạng đầy đủ
        };

        try {
            await WorkReportAPI.update(id, payload);
            alert("Cập nhật báo cáo thành công!");
            nav("/client/calendar"); // Quay về lịch hoặc danh sách báo cáo
        } catch (error) {
            alert("Lỗi khi cập nhật báo cáo: " + (error.response?.data?.message || error.message));
            console.error(error);
        }
    };

    if (!user) return <div>Đang tải...</div>;

    return (
        <ClientReportForm 
            title="Chỉnh Sửa Báo Cáo" 
            data={data} 
            setData={setData} 
            onSubmit={handleSubmit}
            
            // 7. Truyền đủ props xuống Form
            userName={user.fullName || user.username} 
            schedules={schedules} 
        />
    );
}