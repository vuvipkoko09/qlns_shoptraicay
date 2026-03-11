import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css'; // Import CSS chung

// --- Context ---
import { AuthProvider } from './context/AuthContext';

// --- Login ---
import Login from './login/Login';

// --- Layouts & Components ---
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';
import ProtectedRoute from './components/ProtectedRoute';

// ========== ADMIN COMPONENTS ==========
import Dashboard from './admin/Dashboard';

// Admin - Users
import UserList from './admin/users/UserList';
import CreateUser from './admin/users/CreateUser';
import UserEdit from './admin/users/UserEdit';

// Admin - Work Schedule
import WorkScheduleOverview from './admin/workschedule/WorkScheduleOverview';
import StaffScheduleDetail from './admin/workschedule/StaffScheduleDetail';
import CreateWorkSchedule from './admin/workschedule/CreateWorkSchedule';
import EditWorkSchedule from './admin/workschedule/EditWorkSchedule';
import AdminCalendar from './admin/workschedule/WorkScheduleCalendar'; // Alias cho Admin

// Admin - Work Report
import AdminWorkReportList from './admin/workreport/WorkReportList'; // Alias cho Admin
import CreateReportForStaff from './admin/workreport/CreateReportForStaff';
import AdminEditWorkReport from './admin/workreport/AdminEditWorkReport';


// ========== CLIENT COMPONENTS ==========
import ClientHome from './client/home/ClientHome';

// Client - Work Schedule
import ClientCalendar from './client/workschedule/WorkScheduleCalendar'; // Alias cho Client
import ClientScheduleDetail from './client/workschedule/ClientScheduleDetail';

// Client - Work Report
import WorkReportHistory from './client/workreport/WorkReportHistory';
import CreateWorkReport from './client/workreport/CreateWorkReport';
import ClientEditWorkReport from './client/workreport/EditWorkReport';
import EmployeeDashboard from './admin/EmployeeDashboard';
import AdminSalaryManager from './admin/salary/AdminSalaryManager';
import AdminLeaveManager from './admin/leave/AdminLeaveManager';
import ClientAttendance from './client/attendance/ClientAttendance';
import ClientLeave from './client/leave/ClientLeave';
import ClientSalary from './client/salary/ClientSalary';
import AdminAttendanceManager from './admin/attendance/AdminAttendanceManager';
import ForgotPassword from './login/ForgotPassword';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <Routes>

          {/* ========== 1. PUBLIC ROUTES (Login) ========== */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={
            <div className="flex flex-col items-center justify-center h-screen">
              <h1 className="text-3xl font-bold text-red-600">403 - Access Denied</h1>
            </div>
          } />



          {/* ========== 2. ADMIN ROUTES (Quyền: ROLE_ADMIN) ========== */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>

              <Route index element={<Dashboard />} />

              {/* --- Quản lý Nhân viên --- */}
              <Route path="users" element={<UserList />} />
              <Route path="users/create" element={<CreateUser />} />
              <Route path="users/edit/:id" element={<UserEdit />} />

              {/* --- Quản lý Lịch Làm Việc (Phân công) --- */}
              <Route path="workschedule" element={<WorkScheduleOverview />} />
              <Route path="workschedule/staff/:userId" element={<StaffScheduleDetail />} />
              <Route path="workschedule/create" element={<CreateWorkSchedule />} />
              <Route path="workschedule/edit/:id" element={<EditWorkSchedule />} />
              <Route path="workschedule/calendar" element={<AdminCalendar />} />

              {/* --- Quản lý Báo Cáo (Admin Side) --- */}
              {/* Admin xem danh sách để duyệt */}
              <Route path="work-report" element={<AdminWorkReportList />} />
              {/* Admin tạo hộ báo cáo (Form này cần logic cho phép chọn nhân viên) */}
              <Route path="work-report/create" element={<CreateReportForStaff />} />
              {/* Admin sửa/duyệt chi tiết */}
              <Route path="work-report/edit/:id" element={<AdminEditWorkReport />} />
              <Route path="emloyees" element={<EmployeeDashboard />} />
              <Route path="salary" element={<AdminSalaryManager />} />
              <Route path="leave" element={<AdminLeaveManager />} />
              <Route path="attendance" element={<AdminAttendanceManager />} />



            </Route>
          </Route>


          {/* ========== 3. CLIENT ROUTES (Quyền: ROLE_USER & ADMIN) ========== */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_ADMIN']} />}>
            <Route path="/client" element={<ClientLayout />}>

              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<ClientHome />} />

              {/* --- Xem Lịch Làm Việc (Client Side) --- */}
              <Route path="calendar" element={<ClientCalendar />} />
              <Route path="workschedule/detail/:id" element={<ClientScheduleDetail />} />

              {/* --- Làm Báo Cáo (Client Side) --- */}
              {/* Xem lịch sử báo cáo của bản thân */}
              <Route path="history" element={<WorkReportHistory />} />

              {/* Tạo báo cáo mới (Form tự điền tên mình) */}
              <Route path="work-report/create" element={<CreateWorkReport />} />

              {/* Sửa báo cáo của mình (khi chưa duyệt hoặc bị từ chối) */}
              <Route path="work-report/edit/:id" element={<ClientEditWorkReport />} />
              <Route path="attendance" element={<ClientAttendance />} />
              <Route path="leave" element={<ClientLeave />} />
              <Route path="salary" element={<ClientSalary />} />

            </Route>
          </Route>

          {/* Route 404 */}
          <Route path="*" element={<div style={{ textAlign: 'center', marginTop: '50px' }}>404 - Không tìm thấy trang</div>} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;