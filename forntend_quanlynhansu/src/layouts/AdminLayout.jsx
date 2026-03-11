// AdminLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Phần nền trắng cho nội dung bên trong nhìn chuyên nghiệp hơn */}
        <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-4rem)]">
           <Outlet />
        </div>
      </main>
    </div>
  );
}