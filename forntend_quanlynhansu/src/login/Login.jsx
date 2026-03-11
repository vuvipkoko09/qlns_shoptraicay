import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Đảm bảo đường dẫn đúng
import { User, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const userData = await login(username, password);
            if (userData.role?.includes("ROLE_ADMIN")) {
                navigate("/admin");
            } else {
                navigate("/client/home");
            }
        } catch {
            setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
        }
    };

    return (
        // Container chính với hình nền
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1497294815431-9365093b7331?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
            }}
        >
            {/* Lớp phủ màu đen mờ để làm nổi bật form */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            {/* Form Card - Hiệu ứng Glassmorphism */}
            <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 sm:p-10 border border-white/20 transform transition-all">

                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Chào mừng trở lại
                    </h2>
                </div>

                {/* Error Notification */}
                {error && (
                    <div className="mb-6 bg-red-50/80 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center justify-center shadow-sm animate-pulse">
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Username Input */}
                    <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                            Tên đăng nhập
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 
                                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white
                                         transition-all duration-300 ease-in-out shadow-sm"
                                placeholder="Nhập username của bạn"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="group">
                        <div className="flex items-center justify-between mb-2 ml-1">
                            <label className="text-sm font-semibold text-gray-700">
                                Mật khẩu
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-xs font-medium text-blue-600 hover:text-blue-500 hover:underline"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                // Thay đổi pr-4 thành pr-12 để chừa chỗ cho icon con mắt
                                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 
                                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white
                                         transition-all duration-300 ease-in-out shadow-sm"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            
                            {/* 4. Nút bấm hiện/ẩn mật khẩu */}
                            <button
                                type="button" // Quan trọng: type="button" để không bị submit form
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-blue-600 transition-colors duration-300"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30
                                 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Đăng nhập
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500">
                        Chưa có tài khoản?{" "}
                        <span className="font-semibold text-blue-600 hover:text-blue-500 cursor-pointer transition-colors">
                            Liên hệ quản trị viên
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;