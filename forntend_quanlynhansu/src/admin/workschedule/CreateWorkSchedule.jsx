import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import WorkScheduleAPI from "../../services/WorkScheduleService"; // Đảm bảo đã có hàm createGroup
import UserAPI from "../../services/UserService";
import WorkScheduleForm from "./WorkScheduleForm";

export default function CreateWorkSchedule() {
    const nav = useNavigate();
    const [searchParams] = useSearchParams();
    const preUserId = searchParams.get('userId');
    const preDate = searchParams.get('date');
    const [users, setUsers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [data, setData] = useState({
        title: "",
        startTime: preDate ? `${preDate}T07:00:00` : "",
        endTime: preDate ? `${preDate}T11:00:00` : "",
        notes: "",
        targetAmount: "",
        unit: ""
    });

    // Load Users & Set default selection
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const res = await UserAPI.getAll();
                const staffList = res.data.filter(u => u.role !== 'ROLE_ADMIN');
                setUsers(staffList);

                // Nếu URL có sẵn ID nhân viên (Giao nhanh từ trang chi tiết)
                if (preUserId) {
                    const found = staffList.find(u => u.id === parseInt(preUserId));
                    if (found) setSelectedIds([found.id]);
                }
            } catch (error) {
                console.error("Lỗi user:", error);
            }
        };
        loadUsers();
    }, [preUserId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedIds.length === 0) {
            alert("Vui lòng chọn ít nhất 1 nhân viên!");
            return;
        }

        try {
            // Chuẩn bị payload gửi lên Backend
            const payload = {
                userIds: selectedIds, // Gửi mảng ID
                ...data               // Gửi thông tin công việc
            };

            // Gọi API tạo nhóm (Bạn cần thêm hàm này vào Service frontend)
            // axios.post('/api/work-schedules/group', payload)
            await WorkScheduleAPI.createGroup(payload);

            alert(`Đã giao việc thành công cho ${selectedIds.length} người!`);

            // Logic điều hướng
            if (preUserId) {
                nav(`/admin/workschedule/staff/${preUserId}?date=${preDate || ''}`);
            } else {
                nav("/admin/workschedule");
            }

        } catch (error) {
            alert("Lỗi khi tạo lịch! Kiểm tra console.");
            console.error(error);
        }
    };

    return (
        <WorkScheduleForm
            title={preUserId ? "Giao Việc (Chế độ nhanh)" : "Giao Việc (Cá nhân hoặc Nhóm)"}
            data={data}
            setData={setData}
            users={users}

            // Truyền Props mới cho Form Checkbox
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}

            onSubmit={handleSubmit}
        />
    );
}