import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';

const FaceImageUpload = ({ userId }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate đuôi ảnh
        if (!file.name.match(/\.(jpg|jpeg|png)$/)) {
            toast.error("Chỉ chấp nhận file ảnh (jpg, jpeg, png)");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            // Gọi API Java
            const token = localStorage.getItem('token'); // Nếu có bảo mật
            await axios.post(`http://localhost:8080/api/users/${userId}/upload-face`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            toast.success("📸 Cập nhật ảnh khuôn mặt thành công! Nhân viên có thể chấm công ngay.");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi upload ảnh: " + (error.response?.data || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mt-4 p-4 border border-dashed border-blue-300 rounded-lg bg-blue-50 text-center">
            <label className="cursor-pointer block">
                <div className="flex flex-col items-center justify-center gap-2 text-blue-600 hover:text-blue-800 transition">
                    {uploading ? (
                        <FaSpinner className="animate-spin text-3xl" />
                    ) : (
                        <FaCloudUploadAlt className="text-4xl" />
                    )}
                    <span className="font-bold font-sm">
                        {uploading ? "Đang xử lý..." : "Tải ảnh chấm công lên"}
                    </span>
                    <span className="text-xs text-gray-500">(File .jpg, tên file sẽ tự đổi theo ID)</span>
                </div>
                <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    disabled={uploading}
                />
            </label>
        </div>
    );
};

export default FaceImageUpload;