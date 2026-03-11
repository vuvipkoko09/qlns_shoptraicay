import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserAPI from "../../services/UserService";

export default function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await UserAPI.getAll();
        setUsers(res.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa nhân viên này?")) {
      try {
        await UserAPI.delete(id);

        // load lại danh sách
        const res = await UserAPI.getAll();
        setUsers(res.data);
      } catch (error) {
        console.error("Lỗi xóa:", error);
      }
    }
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h2>
        <Link
          to="/admin/users/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <span>➕</span> Thêm nhân viên
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">
                Hình ảnh
              </th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">
                ID
              </th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">
                Họ và Tên
              </th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">
                Email
              </th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">
                SĐT
              </th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">
                Vai trò
              </th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">
                Loại công việc
              </th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">
                Lương cơ bản
              </th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">
                Ngân hàng
              </th>
              <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">
                Trạng thái
              </th>
              <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center bg-gray-100">
                      <img
                        src={
                          u.fileName
                            ? `http://localhost:8080/images/users/${u.fileName}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              u.fullName
                            )}&background=random&color=fff&size=128`
                        }
                        alt="User"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            u.fullName
                          )}&background=random&color=fff&size=128`;
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 border-b text-gray-700 font-mono text-sm">
                    {u.id}
                  </td>
                  <td className="py-3 px-4 border-b text-gray-800 font-medium">
                    {u.fullName}
                  </td>
                  <td className="py-3 px-4 border-b text-gray-600">{u.email}</td>
                  <td className="py-3 px-4 border-b text-gray-600">{u.phone}</td>
                  <td className="py-3 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-green-100 text-green-700"
                        }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-green-100 text-green-700"
                        }`}
                    >
                      {u.workType}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b text-gray-800 font-mono font-bold">
                    {u.salaryRate
                      ? Number(u.salaryRate).toLocaleString("vi-VN")
                      : 0}{" "}
                    ₫
                    <span className="text-[10px] text-gray-400 font-normal ml-1">
                      {u.workType === "Part-time" ? "/giờ" : "/tháng"}
                    </span>
                  </td>
                  {/* HIỂN THỊ BANK ACCOUNT */}
                  <td className="py-3 px-4 border-b text-sm font-mono text-gray-600">
                    {u.bankAccount || "--"}
                  </td>

                  {/* HIỂN THỊ TRẠNG THÁI ACTIVE */}
                  <td className="py-3 px-4 border-b text-center">
                    {u.active ? (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <Link
                      to={`/admin/users/edit/${u.id}`}
                      className="text-blue-600 hover:underline mr-4 font-medium"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="11"
                  className="text-center py-12 text-gray-400 italic"
                >
                  Chưa có nhân viên nào trong hệ thống.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}