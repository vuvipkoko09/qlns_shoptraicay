import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// Import thêm các icon mới: FaUserClock, FaPlaneDeparture, FaMoneyBillWave
import {
    FaClipboardList,
    FaCalendarAlt,
    FaHistory,
    FaSignOutAlt,
    FaUserClock,     
    FaPlaneDeparture,
    FaMoneyBillWave  
} from "react-icons/fa";
import { MdOutlineLocalGroceryStore } from "react-icons/md";

// Nhận thêm prop closeMobile
export default function ClientSidebar({ isOpen, closeMobile }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${isActive
            ? "bg-white text-emerald-800 shadow-md"
            : "text-emerald-100 hover:bg-emerald-700 hover:text-white"
        }`;

    return (
        <aside
            className={`
            fixed top-0 left-0 h-screen w-64 bg-emerald-800 text-white shadow-2xl z-40
            transition-transform duration-300 ease-in-out
            
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
            {/* Header Sidebar: Có thêm padding-left để tránh nút 3 gạch che mất logo */}
            <div className="p-6 pl-16 border-b border-emerald-700 flex justify-between items-center h-[72px]">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <MdOutlineLocalGroceryStore className="text-2xl text-yellow-300" />
                    Fruit Shop
                </h1>
            </div>

            <div className="px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-300 shrink-0">
                    <img
                        src={
                            user.fileName
                                ? `http://localhost:8080/images/users/${user.fileName}`
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user.fullName || user.username
                                )}&background=random&color=fff&size=128`
                        }
                        alt="User"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.fullName || user.username
                            )}&background=random&color=fff&size=128`;
                        }}
                    />
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate">
                        {user?.fullName || user?.username}
                    </p>
                    <p className="text-xs text-emerald-300">Nhân viên kho</p>
                </div>
            </div>

            {/* Menu Navigation */}
            <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
                {/* Khi click link, gọi closeMobile (chỉ tắt nếu đang ở mobile) */}
                <NavLink to="/client/home" className={linkClass} onClick={closeMobile}>
                    <FaClipboardList className="text-xl" />
                    <span>Danh sách việc</span>
                </NavLink>

                <NavLink to="/client/calendar" className={linkClass} onClick={closeMobile}>
                    <FaCalendarAlt className="text-xl" />
                    <span>Xem Lịch Làm Việc</span>
                </NavLink>

                <NavLink to="/client/attendance" className={linkClass} onClick={closeMobile}>
                    <FaUserClock className="text-xl" /> {/* Icon chấm công */}
                    <span>Chấm công</span>
                </NavLink>

                <NavLink to="/client/leave" className={linkClass} onClick={closeMobile}>
                    <FaPlaneDeparture className="text-xl" /> {/* Icon nghỉ phép */}
                    <span>Xin nghỉ</span>
                </NavLink>

                <NavLink to="/client/salary" className={linkClass} onClick={closeMobile}>
                    <FaMoneyBillWave className="text-xl" /> {/* Icon tiền lương */}
                    <span>Xem lương</span>
                </NavLink>

                <NavLink to="/client/history" className={linkClass} onClick={closeMobile}>
                    <FaHistory className="text-xl" />
                    <span>Lịch sử báo cáo</span>
                </NavLink>
            </nav>

            {/* Footer: Logout */}
            <div className="p-4 border-t border-emerald-700">
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <FaSignOutAlt />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}