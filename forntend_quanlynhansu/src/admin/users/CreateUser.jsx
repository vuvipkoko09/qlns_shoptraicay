// src/admin/users/CreateUser.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserAPI from "../../services/UserService";
import UserForm from "./UserForm";

export default function CreateUser() {
    const [data, setData] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
        phone: "",
        role: "ROLE_USER",
        workType: "Full-time",
        salaryRate: "",
        bankAccount: "",
        active: true
    });
    const nav = useNavigate();
    const validateData = () => {
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(data.username)) {
            alert("Username không được chứa khoảng trắng hoặc ký tự đặc biệt!");
            return false;
        }

        const phoneRegex = /^0[0-9]{9}$/;

        if (!data.phone || !phoneRegex.test(data.phone)) {
            alert("Số điện thoại không hợp lệ! Phải có đúng 10 số và bắt đầu bằng số 0.");
            return false;
        }
        if (data.password.length < 6) {
            alert("Mật khẩu phải có ít nhất 6 ký tự!");
            return false;
        }

        if (Number(data.salaryRate) < 0) {
            alert("Lương không được là số âm!");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateData()) {
            return;
        }
        const payload = {
            ...data,
            salaryRate: Number(data.salaryRate)
        };

        try {
            await UserAPI.create(payload);
            alert("Đăng ký thành công!");
            nav("/admin/users");
} catch (error) {
            console.error("Lỗi chi tiết:", error); // In lỗi ra console để debug

            let msg = "Lỗi khi tạo tài khoản!";

            if (error.response && error.response.data) {
                const data = error.response.data;

                if (typeof data === 'string') {
                    msg = data;
                } 
                else if (typeof data === 'object') {
                    msg = data.message || data.error || JSON.stringify(data);
                }
            } else if (error.message) {
                msg = error.message;
            }

            alert(msg);
        }
    };

    return (
        <UserForm
            title="Đăng Ký Nhân Viên Mới"
            data={data}
            setData={setData}
            onSubmit={handleSubmit}
            isEdit={false}
        />
    );
}