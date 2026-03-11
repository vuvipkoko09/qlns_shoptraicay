package com.example.quanlynhansu;

import com.example.quanlynhansu.entity.*;
import com.example.quanlynhansu.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final WorkScheduleRepository scheduleRepo;
    private final WorkReportRepository reportRepo;
    private final AttendanceRepository attendanceRepo;
    private final LeaveRequestRepository leaveRepo;
    private final SalarySlipRepository salaryRepo;
    private final PasswordEncoder passwordEncoder;

    // Danh sách "Sản phẩm" giả lập
    private final String[] PRODUCTS = {
        "Táo Envy Mỹ", "Nho Mẫu Đơn", "Dâu Tây Đà Lạt", "Sầu Riêng Ri6", 
        "Cherry Úc", "Cam Vàng", "Lê Hàn Quốc", "Dưa Lưới", "Kiwi Xanh", "Xoài Cát Hòa Lộc"
    };
    private final String[] ACTIONS = {"Đóng gói", "Kiểm kê", "Vận chuyển", "Sắp xếp", "Dán tem", "Bán hàng", "Vệ sinh quầy"};
    private final String[] UNITS = {"kg", "thùng", "hộp", "trái", "khay"};

    public DatabaseSeeder(UserRepository userRepo, WorkScheduleRepository scheduleRepo,
                          WorkReportRepository reportRepo, AttendanceRepository attendanceRepo,
                          LeaveRequestRepository leaveRepo, SalarySlipRepository salaryRepo,
                          PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.scheduleRepo = scheduleRepo;
        this.reportRepo = reportRepo;
        this.attendanceRepo = attendanceRepo;
        this.leaveRepo = leaveRepo;
        this.salaryRepo = salaryRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Chỉ tạo dữ liệu nếu bảng User đang trống
        if (userRepo.count() == 0) {
            System.out.println(">>> 🏗️ ĐANG KHỞI TẠO DỮ LIỆU MẪU (ĐỦ 3 CA: SÁNG - CHIỀU - TỐI)...");
            String pass = passwordEncoder.encode("123456");
            Random rand = new Random();

            // ==========================================
            // 1. TẠO DANH SÁCH NHÂN VIÊN (20 Người để chia đủ ca)
            // ==========================================
            List<User> users = new ArrayList<>();

            // 1.1 Admin
            users.add(createUser("admin", "admin@fruitshop.com", pass, "Trần Quản Lý", "0909123456", "ROLE_ADMIN", "FULL_TIME", 30000000.0, "190333444555", true));

            // 1.2 Full-time Staff (10 người)
            // String[] fullTimeNames = {
            //     "Nguyễn Văn An", "Lê Thị Bích", "Phạm Văn Cường", "Hoàng Thị Dung", "Trương Văn Em", 
            //     "Đỗ Thị Gấm", "Vũ Văn Hùng", "Cao Thị Lan", "Đinh Văn Khoa", "Lâm Thị Mai"
            // };
            // for (int i = 0; i < fullTimeNames.length; i++) {
            //     String username = "nv" + (i + 1);
            //     users.add(createUser(username, username + "@fruitshop.com", pass, fullTimeNames[i], 
            //             "0901" + String.format("%06d", i), 
            //             "ROLE_USER", "Full-time", 
            //             12000000.0 + (rand.nextInt(5) * 500000), 
            //             "101234" + i, true));
            // }

            // // 1.3 Part-time Staff (10 người)
            // String[] partTimeNames = {
            //     "Trần Tuấn Kiệt", "Lý Lan Anh", "Mai Văn Minh", "Ngô Ngọc Nga", "Bùi Phương Oanh", 
            //     "Dương Quốc Phú", "Hà Thu Quyên", "Phan Văn Sơn", "Trịnh Thị Tuyết", "Võ Văn Uy"
            // };
            // for (int i = 0; i < partTimeNames.length; i++) {
            //     String username = "pt" + (i + 1);
            //     users.add(createUser(username, username + "@fruitshop.com", pass, partTimeNames[i], 
            //             "0902" + String.format("%06d", i), 
            //             "ROLE_USER", "Part-time", 
            //             25000.0 + (rand.nextInt(3) * 5000), 
            //             "202345" + i, true));
            // }
            
            userRepo.saveAll(users);
            System.out.println(">>> ✅ Đã tạo " + users.size() + " tài khoản.");

            // // ==========================================
            // // 2. TẠO LỊCH LÀM VIỆC & CHẤM CÔNG (Đủ 3 ca)
            // // ==========================================
            // List<WorkSchedule> allSchedules = new ArrayList<>();
            // List<Attendance> allAttendances = new ArrayList<>();
            // List<WorkReport> allReports = new ArrayList<>();

            // LocalDate today = LocalDate.now();
            // LocalDate startDate = today.minusDays(14); // 2 tuần trước
            // LocalDate endDate = today.plusDays(7);     // 1 tuần tới

            // // Định nghĩa các khung giờ Ca
            // // Ca Sáng: 6h - 13h (7 tiếng)
            // // Ca Chiều: 13h - 18h (5 tiếng)
            // // Ca Tối: 18h - 22h (4 tiếng)

            // for (LocalDate date = startDate; date.isBefore(endDate); date = date.plusDays(1)) {
                
            //     // Duyệt qua từng nhân viên (bỏ qua admin)
            //     for (int i = 1; i < users.size(); i++) {
            //         User u = users.get(i);
            //         boolean isFullTime = "Full-time".equalsIgnoreCase(u.getWorkType());

            //         // Nghỉ ngẫu nhiên (10%)
            //         if (rand.nextInt(100) < 10) continue;

            //         List<WorkSchedule> dailySchedules = new ArrayList<>();

            //         // --- LOGIC PHÂN CA NGẪU NHIÊN ---
            //         int shiftType = rand.nextInt(3); // 0: Sáng, 1: Chiều, 2: Tối

            //         if (isFullTime) {
            //             // Full-time thường làm 2 ca nối tiếp hoặc làm ca hành chính (Sáng + Chiều)
            //             // Hoặc làm Chiều + Tối
            //             if (shiftType == 0 || shiftType == 1) { 
            //                 // Làm Sáng + Chiều
            //                 dailySchedules.add(createSchedule(u, date, 6, 13, rand)); // Sáng
            //                 dailySchedules.add(createSchedule(u, date, 13, 18, rand)); // Chiều
            //             } else {
            //                 // Làm Chiều + Tối (Thay đổi không khí)
            //                 dailySchedules.add(createSchedule(u, date, 13, 18, rand)); // Chiều
            //                 dailySchedules.add(createSchedule(u, date, 18, 22, rand)); // Tối
            //             }
            //         } else {
            //             // Part-time chỉ làm 1 ca bất kỳ
            //             if (shiftType == 0) {
            //                 dailySchedules.add(createSchedule(u, date, 6, 13, rand)); // Ca Sáng
            //             } else if (shiftType == 1) {
            //                 dailySchedules.add(createSchedule(u, date, 13, 18, rand)); // Ca Chiều
            //             } else {
            //                 dailySchedules.add(createSchedule(u, date, 18, 22, rand)); // Ca Tối
            //             }
            //         }

            //         allSchedules.addAll(dailySchedules);

            //         // --- XỬ LÝ DỮ LIỆU QUÁ KHỨ (Tạo Chấm công & Báo cáo) ---
            //         if (date.isBefore(today)) {
            //             for (WorkSchedule sch : dailySchedules) {
            //                 // 5% quên chấm công hoặc nghỉ không phép
            //                 if (rand.nextInt(100) < 5) continue;

            //                 // Giả lập Check-in/Check-out
            //                 int lateMinutes = 0;
            //                 int earlyMinutes = 0;
            //                 String note = "";

            //                 LocalDateTime realCheckIn = sch.getStartTime();
            //                 LocalDateTime realCheckOut = sch.getEndTime();

            //                 int luck = rand.nextInt(100);
            //                 if (luck < 85) { // 85% đi đúng giờ
            //                     realCheckIn = realCheckIn.minusMinutes(rand.nextInt(15)); // Đến sớm
            //                     realCheckOut = realCheckOut.plusMinutes(rand.nextInt(10)); // Về trễ xíu
            //                 } else if (luck < 95) { // 10% đi trễ
            //                     lateMinutes = 10 + rand.nextInt(20);
            //                     realCheckIn = realCheckIn.plusMinutes(lateMinutes);
            //                     note = "Tắc đường";
            //                 } else { // 5% về sớm
            //                     earlyMinutes = 15 + rand.nextInt(30);
            //                     realCheckOut = realCheckOut.minusMinutes(earlyMinutes);
            //                     note = "Gia đình có việc";
            //                 }

            //                 String status = (lateMinutes > 0 || earlyMinutes > 0) ? "LATE" : "PRESENT";
                            
            //                 Attendance att = Attendance.builder()
            //                         .user(u).schedule(sch).date(date)
            //                         .checkInTime(realCheckIn).checkOutTime(realCheckOut)
            //                         .status(status)
            //                         .lateMinutes(lateMinutes)
            //                         .earlyLeaveMinutes(earlyMinutes)
            //                         .note(note)
            //                         .build();
            //                 allAttendances.add(att);

            //                 // Tạo Báo cáo công việc
            //                 if (rand.nextInt(100) < 95) { // 95% có báo cáo
            //                     WorkReport rpt = WorkReport.builder()
            //                             .user(u).schedule(sch)
            //                             .reportDate(realCheckOut)
            //                             .actualAmount(sch.getTargetAmount() + rand.nextInt(5))
            //                             .workDone("Hoàn thành " + sch.getTitle())
            //                             .status("APPROVED")
            //                             .build();
            //                     allReports.add(rpt);
            //                 }
            //             }
            //         }
            //     }
            // }

            // scheduleRepo.saveAll(allSchedules);
            // attendanceRepo.saveAll(allAttendances);
            // reportRepo.saveAll(allReports);
            // System.out.println(">>> ✅ Đã tạo " + allSchedules.size() + " lịch làm việc.");

            // // ==========================================
            // // 3. TẠO ĐƠN NGHỈ PHÉP
            // // ==========================================
            // List<LeaveRequest> leaves = new ArrayList<>();
            // leaves.add(LeaveRequest.builder().user(users.get(2)).startDate(today.minusDays(3)).endDate(today.minusDays(1)).reason("Ốm sốt").status("APPROVED").adminComment("Ok").build());
            // leaveRepo.saveAll(leaves);

            // // ==========================================
            // // 4. TẠO BẢNG LƯƠNG
            // // ==========================================
            // // (Giữ nguyên logic cũ hoặc nâng cấp tùy ý, ở đây mình giữ đơn giản để code không quá dài)
            // List<SalarySlip> slips = new ArrayList<>();
            // int lastMonth = today.minusMonths(1).getMonthValue();
            // int currentYear = today.getYear();
            // if(lastMonth == 12) currentYear--;

            // for(int i=1; i<users.size(); i++){
            //     User u = users.get(i);
            //     slips.add(SalarySlip.builder()
            //         .user(u).month(lastMonth).year(currentYear)
            //         .baseSalary(u.getSalaryRate())
            //         .totalWorkHours("Full-time".equals(u.getWorkType()) ? 180.0 : 85.0)
            //         .totalDays(24)
            //         .finalSalary(u.getSalaryRate() + 500000) // Dummy calc
            //         .status("PAID")
            //         .build());
            // }
            // salaryRepo.saveAll(slips);

            System.out.println(">>> 🏁 SEEDING COMPLETE! (Admin: admin@fruitshop.com / 123456)");
        }
    }

    // --- Helper Methods ---

    private User createUser(String username, String email, String pass, String fullName, String phone, String role, String type, Double salary, String bank, Boolean active) {
        return User.builder()
                .username(username).email(email).password(pass).fullName(fullName).phone(phone)
                .role(role).workType(type).salaryRate(salary).bankAccount(bank).active(active)
                .build();
    }

    // private WorkSchedule createSchedule(User u, LocalDate date, int startH, int endH, Random rand) {
    //     String action = ACTIONS[rand.nextInt(ACTIONS.length)];
    //     String product = PRODUCTS[rand.nextInt(PRODUCTS.length)];
    //     String unit = UNITS[rand.nextInt(UNITS.length)];
    //     long target = 20 + rand.nextInt(80);

    //     return WorkSchedule.builder()
    //             .user(u)
    //             .title(action + " " + target + " " + unit + " " + product)
    //             .startTime(LocalDateTime.of(date, LocalTime.of(startH, 0)))
    //             .endTime(LocalDateTime.of(date, LocalTime.of(endH, 0)))
    //             .status("ASSIGNED")
    //             .targetAmount(target)
    //             .unit(unit)
    //             .notes("Ca " + (startH < 12 ? "Sáng" : (startH < 18 ? "Chiều" : "Tối")))
    //             .build();
    // }
}