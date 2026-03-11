import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        // Chưa đăng nhập -> đá về trang login
        return <Navigate to="/login" replace />;
    }

    // Kiểm tra quyền (Nếu có yêu cầu role cụ thể)
    // Giả sử user.roles là mảng ['ROLE_ADMIN']
    if (allowedRoles && !allowedRoles.some(role => user.role.includes(role))) {
        // Đăng nhập rồi nhưng không đủ quyền -> Trang 403 hoặc về trang chủ
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;