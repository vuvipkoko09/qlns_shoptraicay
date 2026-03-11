import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// Import bộ icon xịn xò
import { FaTachometerAlt, FaUsers, FaCalendarAlt, FaClipboardList, FaSignOutAlt, FaStore } from "react-icons/fa";

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Style cho link: Khi active sẽ có nền sáng hơn và viền trái màu xanh
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 border-l-4 ${isActive
      ? "bg-slate-800 border-blue-500 text-white"
      : "border-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 shadow-xl z-20">
      {/* --- LOGO AREA --- */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900">
        <FaStore className="text-blue-500 text-2xl mr-2" />
        <div>
          <h1 className="text-lg font-bold tracking-wide">Fruit Shop</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Admin Portal</p>
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 py-6 flex flex-col gap-1">
        <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase">Quản lý chung</div>

        <NavLink to="/admin" end className={linkClass}>
          <FaTachometerAlt className="text-lg" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/users" className={linkClass}>
          <FaUsers className="text-lg" />
          <span>Nhân viên</span>
        </NavLink>

        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase">Công việc</div>

        <NavLink to="/admin/workschedule" className={linkClass}>
          <FaCalendarAlt className="text-lg" />
          <span>Phân lịch & Ca</span>
        </NavLink>

        <NavLink to="/admin/work-report" className={linkClass}>
          <FaClipboardList className="text-lg" />
          <span>Duyệt báo cáo</span>
        </NavLink>
        <NavLink to="/admin/salary" className={linkClass}>
          <FaClipboardList className="text-lg" />
          <span>Tính lương</span>
        </NavLink>
        <NavLink to="/admin/leave" className={linkClass}>
          <FaClipboardList className="text-lg" />
          <span>Duyệt nghỉ phép</span>
        </NavLink>
                <NavLink to="/admin/attendance" className={linkClass}>
          <FaClipboardList className="text-lg" />
          <span>Xem check in</span>
        </NavLink>

      </nav>

      {/* --- USER INFO & LOGOUT --- */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
            {(user?.username || "A").charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.username || "Admin"}</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <FaSignOutAlt /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}