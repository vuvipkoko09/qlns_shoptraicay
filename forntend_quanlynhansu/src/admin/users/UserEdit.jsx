import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserAPI from "../../services/UserService";
import UserForm from "./UserForm";
import { toast } from 'react-toastify';
export default function UserEdit() {
    const { id } = useParams();
    const nav = useNavigate();
    const [data, setData] = useState({});
    const [file, setFile] = useState(null);
    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await UserAPI.getById(id);
                setData({ ...res.data, password: "" });
            } catch (error) {
                console.error("Lỗi load data:", error);
            }
        };
        loadData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- 1. TẠO FORM DATA (Gói hàng) ---
        const formData = new FormData();

        // Đẩy tất cả dữ liệu text từ state 'data' vào formData
        // (Java @ModelAttribute sẽ hứng các field này)
        formData.append("fullName", data.fullName || "");
        formData.append("username", data.username || ""); 
        formData.append("email", data.email || "");
        formData.append("phone", data.phone || "");
        formData.append("role", data.role || "ROLE_USER");
        formData.append("workType", data.workType || "Full-time");
        formData.append("salaryRate", data.salaryRate || 0);
        formData.append("bankAccount", data.bankAccount || "");
        formData.append("active", data.active);

        // Chỉ gửi password nếu người dùng có nhập mới
        if (data.password) {
            formData.append("password", data.password);
        }

        // --- 2. ĐẨY FILE ẢNH VÀO (Quan trọng nhất) ---
        if (file) {
            formData.append("file", file);
        }

        try {
            // --- 3. GỌI API UPDATE MỚI (Gửi gói hàng đi) ---
            // Chỉ cần gọi 1 hàm này là xong cả cập nhật text lẫn upload ảnh
            await UserAPI.update(id, formData);

            toast.success("✅ Cập nhật thành công! (Dữ liệu AI đã được học)");
            nav("/admin/users");
        } catch (error) {
            console.error(error);
            const msg = error.response?.data || "Lỗi cập nhật!";
            toast.error("❌ " + msg);
        }
    };

    return (
        <UserForm
            title="Chỉnh Sửa Thông Tin User"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            isEdit={true}
            setFile={setFile}
        />
    );
}