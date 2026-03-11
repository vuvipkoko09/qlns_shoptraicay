import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import AuthService from '../services/AuthService';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Form, 2: Thành công
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // 1. Kiểm tra mật khẩu nhập lại có khớp không
        if (formData.newPassword !== formData.confirmPassword) {
            setError("Mật khẩu nhập lại không khớp!");
            return;
        }

        // 2. Kiểm tra độ dài mật khẩu (tuỳ chọn)
        if (formData.newPassword.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }

        setLoading(true);

        try {
            // Gọi API
            await AuthService.resetPassword(formData.username, formData.email, formData.newPassword);

            // 3. Chuyển sang màn hình thành công
            setStep(2);

        } catch (err) {
            // Lấy thông báo lỗi từ backend
            const errorMsg = err.response?.data || "Có lỗi xảy ra, vui lòng kiểm tra lại thông tin.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497294815431-9365093b7331?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')", backgroundSize: 'cover' }}>

            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 transform transition-all">

                {/* Nút quay lại (Chỉ hiện khi ở Step 1) */}
                {step === 1 && (
                    <Link to="/" className="absolute top-4 left-4 text-gray-500 hover:text-blue-600 transition">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                )}

                <div className="text-center mb-8 mt-4">
                    <h2 className="text-3xl font-bold text-gray-800">Khôi phục mật khẩu</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        {step === 1 ? "Nhập thông tin xác minh để đặt lại mật khẩu" : ""}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Hiển thị lỗi */}
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-pulse">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                                placeholder="VD: nv_kho01"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email đã đăng ký</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                            <div className="relative">
                                <input
                                    // 3. Thay đổi type và thêm padding phải (pr-10)
                                    type={showNewPass ? "text" : "password"}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPass(!showNewPass)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600"
                                >
                                    {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* --- Nhập lại mật khẩu --- */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu mới</label>
                            <div className="relative">
                                <input
                                    // 3. Thay đổi type và thêm padding phải (pr-10)
                                    type={showConfirmPass ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600"
                                >
                                    {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition transform active:scale-95 disabled:bg-gray-400"
                        >
                            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                        </button>
                    </form>
                ) : (
                    // Màn hình thành công (Step 2)
                    <div className="text-center py-6 animate-fade-in">
                        <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Đổi mật khẩu thành công!</h3>
                        <p className="text-gray-500 mb-8">Tài khoản của bạn đã được cập nhật mật khẩu mới.</p>
                        <button
                            onClick={() => navigate('/')} // Quay về Login (trang chủ)
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow transition"
                        >
                            Quay lại Đăng nhập ngay
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;