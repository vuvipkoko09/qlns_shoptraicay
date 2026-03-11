import { useEffect, useState } from "react";
import WorkScheduleAPI from "../../services/WorkScheduleService";
import UserAPI from "../../services/UserService"; // 1. Import UserAPI
import WorkScheduleForm from "./WorkScheduleForm";
import { useNavigate, useParams } from "react-router-dom";

export default function EditWorkSchedule() {
    const { id } = useParams();
    const nav = useNavigate();
    const [data, setData] = useState({});
    const [users, setUsers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    useEffect(() => {
        const loadData = async () => {
            try {
                const [scheduleRes, userRes] = await Promise.all([
                    WorkScheduleAPI.getById(id),
                    UserAPI.getAll()
                ]);

                const scheduleData = scheduleRes.data;
                setData(scheduleData);
                setUsers(userRes.data);

                if (scheduleData.userId) {
                    setSelectedIds([scheduleData.userId]);
                } else if (scheduleData.user && scheduleData.user.id) {
                    setSelectedIds([scheduleData.user.id]);
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
            }
        };

        loadData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await WorkScheduleAPI.update(id, data);
            nav("/admin/workschedule");
        } catch (error) {
            alert("Lỗi khi cập nhật!");
            console.error(error);
        }
    };

    return (
        <WorkScheduleForm
            title="Điều Chỉnh Công Việc"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            users={users}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
        />
    );
}