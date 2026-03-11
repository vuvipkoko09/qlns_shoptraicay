import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function UserForm({ data, setData, onSubmit, title, isEdit, setFile }) {

    const [previewUrl, setPreviewUrl] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    useEffect(() => {
        if (data && data.fileName) {
            setPreviewUrl(`http://localhost:8080/images/users/${data.fileName}`);
        } else {
            setPreviewUrl(null);
        }
    }, [data]);
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
                console.log("Đã dọn dẹp bộ nhớ ảnh:", previewUrl);
            }
        };
    }, [previewUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'active') {
            setData({ ...data, [name]: value === 'true' });
        } else {
            setData({ ...data, [name]: value });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            if (setFile) {
                setFile(file);
            }
        }
    };
    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">{title}</h2>

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Full Name */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
                    <input
                        type="text"
                        name="fullName"
                        value={data.fullName || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>
                {/* Username (Mới thêm) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập (Username)</label>
                    <input
                        type="text"
                        name="username"
                        value={data.username || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-yellow-50"
                        placeholder="VD: nv_kho01"
                        required
                        disabled={isEdit}
                    />
                </div>
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={data.email || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>
                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu {isEdit && <span className="text-xs text-gray-400 font-normal">(Để trống nếu không đổi)</span>}
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="******"
                            required={!isEdit}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                        type="text"
                        name="phone"
                        value={data.phone || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số Tài Khoản (Ngân hàng)</label>
                    <input type="text" name="bankAccount" value={data.bankAccount || ""} onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                        placeholder="VD: 1903..." />
                </div>
                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                    <select
                        name="role"
                        value={data.role || "ROLE_USER"}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="ROLE_USER">USER (Nhân viên)</option>
                        <option value="ROLE_ADMIN">ADMIN (Quản lý)</option>
                    </select>
                </div>
                {/* Work Type (Mới thêm) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại hình làm việc</label>
                    <select
                        name="workType"
                        value={data.workType || "Full-time"}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="Full-time">Full-time (Toàn thời gian)</option>
                        <option value="Part-time">Part-time (Bán thời gian)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {data.workType === 'Part-time' ? 'Lương theo giờ (VNĐ)' : 'Lương cứng hàng tháng (VNĐ)'}
                    </label>
                    <input
                        type="number"
                        name="salaryRate"
                        value={data.salaryRate || ""}
                        onChange={handleChange}
                        placeholder={data.workType === 'Part-time' ? "VD: 25000" : "VD: 8000000"}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-800"
                        required
                        min="0"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái hoạt động</label>
                    <select
                        name="active"
                        value={data.active === true ? "true" : "false"}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 focus:ring-2 outline-none font-bold ${data.active ? 'text-green-700 border-green-300 bg-green-50' : 'text-red-700 border-red-300 bg-red-50'}`}
                    >
                        <option value="true">✅ Đang làm việc (Active)</option>
                        <option value="false">❌ Đã nghỉ / Khóa (Inactive)</option>
                    </select>
                </div>
                <div className="mb-4 md:col-span-2">
                    <label className="block text-sm font-bold mb-2">Ảnh đại diện</label>

                    <div className="flex items-center gap-4">
                        {/* Khung hiển thị ảnh */}
                        <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300">
                            <img
                                src={previewUrl ? previewUrl : "https://via.placeholder.com/150"}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Nút chọn file */}
                        <input
                            type="file"
                            onChange={handleFileChange} // Đã khai báo hàm này ở trên
                            accept="image/*"
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                </div>
                <div className="md:col-span-2 pt-6 flex gap-4">
                    <button
                        type="button"
                        onClick={() => nav("/admin/users")} 
                        className="w-1/3 bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition"
                    >
                        Hủy bỏ
                    </button>

                    <button
                        type="submit"
                        className="w-2/3 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition shadow-md"
                    >
                        {isEdit ? "Cập nhật Thông tin" : "Tạo Tài khoản Mới"}
                    </button>
                </div>
            </form>
        </div>
    );
}