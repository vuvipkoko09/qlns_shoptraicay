import React, { useState, useEffect, useMemo } from 'react';
import UserService from '../../services/UserService';
import SalaryService from '../../services/SalaryService';
import { FaSearch, FaUserTie, FaUser } from 'react-icons/fa';

export default function AdminSalaryManager() {
    const [userId, setUserId] = useState("");
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [result, setResult] = useState(null);
    const [users, setUsers] = useState([]);
    
    // --- STATE CHO TÌM KIẾM & LỌC ---
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL"); // ALL, ADMIN, USER

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await UserService.getAll();
            setUsers(res.data);
        } catch (error) {
            console.error("Lỗi tải danh sách nhân viên:", error);
        }
    };

    const handleCalculate = async () => {
        if (!userId) return alert("Vui lòng chọn nhân viên từ danh sách bên trái!");
        try {
            const res = await SalaryService.calculate(userId, month, year);
            setResult(res.data);
            // alert("Tính lương thành công!"); // Bỏ alert cho đỡ phiền
        } catch (e) {
            setResult(null); 
            alert(e.response?.data?.message || "Lỗi tính lương (Có thể chưa có dữ liệu chấm công tháng này)");
        }
    };

    // --- LOGIC LỌC NHÂN VIÊN ---
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            // 1. Lọc theo từ khóa (Tên hoặc Email)
            const matchesSearch = (user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
            
            // 2. Lọc theo vai trò (Kiểm tra xem role có chứa từ khóa lọc không)
            // Ví dụ: roleFilter="ADMIN" sẽ khớp với user.role="ADMIN" hoặc "ROLE_ADMIN"
            const matchesRole = roleFilter === 'ALL' || (user.role && user.role.includes(roleFilter));
            
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    // Hàm chọn nhân viên
    const handleSelectUser = (id) => {
        setUserId(id);
        setResult(null); // Reset kết quả cũ khi chọn người mới
    };

    return (
        <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Quản Lý & Tính Lương</h2>

            <div className="flex gap-6 h-full items-start">
                
                {/* --- CỘT TRÁI: DANH SÁCH NHÂN VIÊN --- */}
                <div className="w-1/3 bg-white rounded-lg shadow border border-gray-200 flex flex-col h-full max-h-full">
                    {/* Header: Tìm kiếm & Filter */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                        <div className="relative mb-3">
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Tìm theo tên, email..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setRoleFilter('ALL')}
                                className={`flex-1 py-1 text-xs font-bold rounded transition ${roleFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
                            >
                                Tất cả
                            </button>
                            <button 
                                onClick={() => setRoleFilter('ADMIN')}
                                className={`flex-1 py-1 text-xs font-bold rounded transition ${roleFilter === 'ADMIN' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
                            >
                                Admin
                            </button>
                            <button 
                                onClick={() => setRoleFilter('USER')}
                                className={`flex-1 py-1 text-xs font-bold rounded transition ${roleFilter === 'USER' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
                            >
                                Nhân viên
                            </button>
                        </div>
                    </div>

                    {/* Body: Danh sách cuộn */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {filteredUsers.length > 0 ? filteredUsers.map(u => {
                            // Xử lý Avatar cho từng user trong list
                            const displayName = u.fullName || u.username || "User";
                            const avatarSrc = u.fileName 
                                ? `http://localhost:8080/images/users/${u.fileName}`
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=64`;

                            return (
                                <div 
                                    key={u.id}
                                    onClick={() => handleSelectUser(u.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition flex items-center gap-3 ${
                                        String(userId) === String(u.id) 
                                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                                        : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                                        <img 
                                            src={avatarSrc} 
                                            alt="avt" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=64`;
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-gray-800 truncate text-sm">{displayName}</div>
                                        <div className="text-xs text-gray-500 truncate">{u.email}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-mono text-gray-400 block">#{u.id}</span>
                                        {(u.role === 'ADMIN' || u.role === 'ROLE_ADMIN') && (
                                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">Admin</span>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center text-gray-400 py-8 italic">Không tìm thấy nhân viên nào.</div>
                        )}
                    </div>
                    <div className="p-3 border-t text-xs text-center text-gray-500 bg-gray-50 rounded-b-lg">
                        Tổng cộng: <b>{filteredUsers.length}</b> nhân viên
                    </div>
                </div>

                {/* --- CỘT PHẢI: FORM TÍNH & KẾT QUẢ --- */}
                <div className="w-2/3 flex flex-col gap-6">
                    
                    {/* Panel điều khiển */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                            ⚙️ Cấu hình tính lương
                        </h3>
                        <div className="flex flex-wrap gap-6 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-bold mb-1 text-gray-700">Nhân viên đang chọn</label>
                                <div className="w-full border border-gray-300 bg-gray-50 p-2 rounded text-gray-700 font-medium h-[42px] flex items-center truncate">
                                    {userId 
                                        ? users.find(u => String(u.id) === String(userId))?.fullName 
                                        : <span className="text-gray-400 italic">-- Vui lòng chọn bên trái --</span>
                                    }
                                </div>
                            </div>

                            <div className="w-24">
                                <label className="block text-sm font-bold mb-1 text-gray-700">Tháng</label>
                                <input
                                    type="number"
                                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold h-[42px]"
                                    value={month}
                                    onChange={e => setMonth(e.target.value)}
                                    min="1" max="12"
                                />
                            </div>

                            <div className="w-28">
                                <label className="block text-sm font-bold mb-1 text-gray-700">Năm</label>
                                <input
                                    type="number"
                                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold h-[42px]"
                                    value={year}
                                    onChange={e => setYear(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleCalculate}
                                disabled={!userId}
                                className={`px-6 py-2 rounded-lg font-bold transition shadow h-[42px] flex items-center gap-2 ${
                                    !userId 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform active:scale-95'
                                }`}
                            >
                                <span>💰</span> TÍNH LƯƠNG
                            </button>
                        </div>
                    </div>

                    {/* Hiển thị kết quả (Phiếu lương) */}
                    {result ? (
                        <div className="bg-white border border-green-200 shadow-lg rounded-lg overflow-hidden animate-fade-in flex-1 flex flex-col">
                            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 flex justify-between items-center shadow-sm">
                                <h3 className="font-bold text-xl flex items-center gap-2">
                                    🧾 PHIẾU LƯƠNG CHI TIẾT
                                </h3>
                                <span className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-mono font-bold border border-white/30">
                                    Tháng {result.month}/{result.year}
                                </span>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col justify-center">
                                {/* Thông tin nhân viên trong phiếu */}
                                <div className="flex justify-between items-start mb-8 pb-6 border-b border-dashed border-gray-300">
                                    <div className="flex items-center gap-5">
                                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
                                            <img 
                                                src={(() => {
                                                    const u = users.find(user => String(user.id) === String(userId));
                                                    return u?.fileName 
                                                        ? `http://localhost:8080/images/users/${u.fileName}`
                                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(result.userName)}&background=random&color=fff&size=128`;
                                                })()}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(result.userName)}&background=random&color=fff&size=128`;
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 uppercase tracking-wide">Nhân viên</div>
                                            <div className="text-3xl font-bold text-gray-800 mb-1">{result.userName}</div>
                                            <div className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block">Mã NV: #{userId}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500 mb-1">Trạng thái lương</div>
                                        <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 font-bold rounded-full text-sm border border-green-200">
                                            ✅ {result.status || "Đã Tính"}
                                        </span>
                                    </div>
                                </div>

                                {/* Chi tiết tiền */}
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-gray-700">
                                    {/* Cột trái */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">Ngày công</span>
                                            <span className="font-bold text-lg">{result.totalDays || 0} ngày</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">Tổng giờ làm</span>
                                            <span className="font-bold text-lg">{result.totalWorkHours ? Number(result.totalWorkHours).toFixed(1) : 0} giờ</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">Lương cơ bản</span>
                                            <span className="font-bold text-lg">{Math.round(result.baseSalary || 0).toLocaleString('vi-VN')} ₫/h</span>
                                        </div>
                                    </div>

                                    {/* Cột phải */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                            <span className="text-gray-600 flex items-center gap-2">🎁 Thưởng</span>
                                            <span className="font-bold text-green-600 text-lg">+{Math.round(result.totalBonus || 0).toLocaleString('vi-VN')} ₫</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                            <span className="text-gray-600 flex items-center gap-2">⚠️ Phạt</span>
                                            <span className="font-bold text-red-500 text-lg">-{Math.round(result.totalPenalty || 0).toLocaleString('vi-VN')} ₫</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="font-bold text-gray-800 text-xl uppercase">Thực lĩnh</span>
                                            <span className="font-bold text-3xl text-blue-700 drop-shadow-sm">
                                                {Math.round(result.finalSalary || 0).toLocaleString('vi-VN')} ₫
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 gap-3 min-h-[300px]">
                            <span className="italic font-medium">Chọn nhân viên bên trái và bấm "Tính Lương"</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}