import { useState, useEffect, useRef } from "react"; // Thêm useRef
import { useNavigate, useSearchParams } from "react-router-dom";
import WorkReportAPI from "../../services/WorkReportService";
import WorkScheduleAPI from "../../services/WorkScheduleService";
import ClientReportForm from "./ClientReportForm";
import { useAuth } from "../../context/AuthContext";

export default function CreateWorkReport() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const nav = useNavigate();

    const initialScheduleId = searchParams.get("scheduleId") || "";
    const [existingReports, setExistingReports] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const hasCheckedRef = useRef(false);

    const [data, setData] = useState({
        userId: "",
        scheduleId: initialScheduleId,
        reportDate: new Date().toISOString().split('T')[0],
        workDone: "",
        actualAmount: "",
        problems: "",
        notes: "",
        status: "Pending"
    });

    const checkDuplicate = (reports, currentScheduleId) => {
        if (!Array.isArray(reports) || !currentScheduleId) return null;
        return reports.find(r => {
            const id1 = r.scheduleId;
            const id2 = r.workSchedule?.id;
            const id3 = r.schedule?.id;
            return (id1 == currentScheduleId) || (id2 == currentScheduleId) || (id3 == currentScheduleId);
        });
    };

    useEffect(() => {
        const loadData = async () => {
            if (user && user.userId) {
                setData(prev => ({ ...prev, userId: user.userId }));
                try {
                    const [scheduleRes, reportRes] = await Promise.all([
                        WorkScheduleAPI.getByUserId(user.userId),
                        WorkReportAPI.getByUserId(user.userId)
                    ]);
                    setSchedules(scheduleRes.data || []);
                    setExistingReports(Array.isArray(reportRes.data) ? reportRes.data : []);
                } catch (error) {
                    console.error("❌ Lỗi tải dữ liệu:", error);
                }
            }
        };
        loadData();
    }, [user]);

    useEffect(() => {
        // Nếu chưa chọn lịch hoặc chưa tải xong báo cáo cũ thì không làm gì
        if (!data.scheduleId || existingReports.length === 0) return;

        // Tìm báo cáo trùng
        const foundReport = checkDuplicate(existingReports, data.scheduleId);

        if (foundReport) {
            // 💡 MẸO QUAN TRỌNG: Dùng setTimeout và lưu vào biến
            const timer = setTimeout(() => {
                const confirmEdit = window.confirm(
                    "⚠️ Ca làm việc này ĐÃ ĐƯỢC BÁO CÁO.\n\nBạn có muốn chuyển sang trang CHỈNH SỬA báo cáo đó không?"
                );

                if (confirmEdit) {
                    nav(`/client/work-report/edit/${foundReport.id}`);
                } else {
                    // Nếu Cancel, reset lại ô chọn
                    setData(prev => ({ ...prev, scheduleId: "" }));
                }
            }, 100); 
            return () => clearTimeout(timer);
        }
    }, [data.scheduleId, existingReports, nav]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const foundReport = checkDuplicate(existingReports, data.scheduleId);
        if (foundReport) {
            alert("Ca làm việc này đã có báo cáo! Vui lòng kiểm tra lại.");
            return;
        }

        const now = new Date();
        const selectedDate = new Date(data.reportDate);
        selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

        const payload = {
            ...data,
            userId: Number(data.userId),
            scheduleId: Number(data.scheduleId),
            actualAmount: data.actualAmount ? Number(data.actualAmount) : 0,
            reportDate: selectedDate.toISOString()
        };

        try {
            await WorkReportAPI.create(payload);
            alert("Báo cáo thành công!");
            nav("/client/calendar");
        } catch (error) {
            console.error("Lỗi:", error);
            alert("Lỗi: " + (error.response?.data?.message || "Vui lòng kiểm tra lại dữ liệu nhập"));
        }
    };

    if (!user) return <div>Đang tải...</div>;

    return (
        <ClientReportForm
            title="Báo Cáo Công Việc Của Tôi"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            userName={user.fullName || user.username}
            schedules={schedules}
        />
    );
}