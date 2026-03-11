package com.example.quanlynhansu.service.impl;

import com.example.quanlynhansu.dto.AttendanceDTO;
import com.example.quanlynhansu.dto.CheckInRequest;
import com.example.quanlynhansu.entity.Attendance;
import com.example.quanlynhansu.entity.User;
import com.example.quanlynhansu.entity.WorkSchedule;
import com.example.quanlynhansu.repository.AttendanceRepository;
import com.example.quanlynhansu.repository.UserRepository;
import com.example.quanlynhansu.repository.WorkScheduleRepository;
import com.example.quanlynhansu.service.AttendanceService; // Bạn nhớ tạo interface này trước nhé
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final UserRepository userRepository;

    @Override
    public Attendance checkIn(Long userId, CheckInRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        LocalDate today = LocalDate.now();

        // 1. Kiểm tra Attendance (Bảng chấm công - dùng Date)
        List<Attendance> todayList = attendanceRepository.findByUserIdAndDate(userId, today);

        boolean hasOpenSession = todayList.stream().anyMatch(a -> a.getCheckOutTime() == null);
        if (hasOpenSession) {
            throw new RuntimeException("Bạn đang trong ca làm việc! Vui lòng Check-out ca cũ trước.");
        }

        // --- SỬA ĐOẠN NÀY: TÌM LỊCH LÀM VIỆC (WorkSchedule - dùng DateTime) ---
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        // Gọi hàm repository mới với 3 tham số
        List<WorkSchedule> schedules = workScheduleRepository.findByUserIdAndDate(userId, startOfDay, endOfDay);
        // ----------------------------------------------------------------------

        WorkSchedule schedule = schedules.isEmpty() ? null : schedules.get(0);

        Attendance attendance = Attendance.builder()
                .user(user)
                .date(today)
                .checkInTime(LocalDateTime.now())
                .status("PRESENT")
                .note(request.getNote())
                .schedule(schedule)
                .build();

        if (schedule != null && schedule.getStartTime() != null) {
            long minutesLate = ChronoUnit.MINUTES.between(schedule.getStartTime(), LocalDateTime.now());
            if (minutesLate > 15) {
                attendance.setStatus("LATE");
                attendance.setLateMinutes((int) minutesLate);
            } else {
                attendance.setLateMinutes(0);
            }
        }

        return attendanceRepository.save(attendance);
    }

    public Attendance checkOut(Long userId) {
        LocalDate today = LocalDate.now();
        List<Attendance> todayList = attendanceRepository.findByUserIdAndDate(userId, today);

        // 1. Tìm ca nào đang chưa Check-out
        Attendance activeSession = todayList.stream()
                .filter(a -> a.getCheckOutTime() == null)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm việc nào đang mở để Check-out!"));

        LocalDateTime now = LocalDateTime.now();
        activeSession.setCheckOutTime(now);
        WorkSchedule schedule = activeSession.getSchedule();

        // Chỉ tính nếu ca làm việc này có quy định giờ kết thúc
        if (schedule != null && schedule.getEndTime() != null) {

            LocalDateTime scheduledEndTime = activeSession.getDate().atTime(schedule.getEndTime().toLocalTime());
            long minutesEarly = ChronoUnit.MINUTES.between(now, scheduledEndTime);

            if (minutesEarly > 15) { // Cho phép về sớm 15 phút (Threshold)
                activeSession.setEarlyLeaveMinutes((int) minutesEarly);

                // Cập nhật trạng thái: Nếu đang là PRESENT (đúng giờ) thì đổi thành EARLY
                // Nếu đang là LATE (đi trễ) thì giữ nguyên LATE hoặc đổi thành BOTH (tuỳ bạn)
                if ("PRESENT".equals(activeSession.getStatus())) {
                    activeSession.setStatus("EARLY_LEAVE");
                }
            } else {
                activeSession.setEarlyLeaveMinutes(0);
            }
        } else {
            // Trường hợp không có lịch hoặc lịch không set giờ về
            activeSession.setEarlyLeaveMinutes(0);
        }
        return attendanceRepository.save(activeSession);
    }

    // Hàm mới thay cho getTodayAttendance
    @Override
    public List<Attendance> getTodayList(Long userId) {
        return attendanceRepository.findByUserIdAndDate(userId, LocalDate.now());
    }

    private AttendanceDTO mapToDTO(Attendance entity) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(entity.getId());
        dto.setDate(entity.getDate());
        dto.setCheckInTime(entity.getCheckInTime());
        dto.setCheckOutTime(entity.getCheckOutTime());
        dto.setStatus(entity.getStatus());
        dto.setLateMinutes(entity.getLateMinutes());
        dto.setEarlyLeaveMinutes(entity.getEarlyLeaveMinutes());
        dto.setNote(entity.getNote());

        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
            dto.setUserName(entity.getUser().getFullName());
        }

        // --- MAPPING LỊCH LÀM VIỆC (QUAN TRỌNG) ---
        if (entity.getSchedule() != null) {
            dto.setScheduleId(entity.getSchedule().getId());
            dto.setScheduleTitle(entity.getSchedule().getTitle());
            // Lấy giờ từ LocalDateTime trong schedule
            dto.setScheduleStartTime(entity.getSchedule().getStartTime().toLocalTime());
            dto.setScheduleEndTime(entity.getSchedule().getEndTime().toLocalTime());
        }
        // -------------------------------------------

        return dto;
    }

    // Đảm bảo hàm getHistory gọi hàm mapToDTO này
    @Override
    public List<AttendanceDTO> getAttendanceHistory(Long userId, int month, int year) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        List<Attendance> list = attendanceRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        // Convert List<Entity> sang List<DTO>
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public String processFaceCheckIn(Long userId) {
        LocalDateTime now = LocalDateTime.now();

        LocalDate today = now.toLocalDate();
        LocalTime currentTime = now.toLocalTime();

        // --- SỬA ĐOẠN NÀY CHO FACE CHECKIN ---
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        List<WorkSchedule> todaySchedules = workScheduleRepository.findByUserIdAndDate(userId, startOfDay, endOfDay);
        // --------------------------------------

        if (todaySchedules.isEmpty()) {
            throw new RuntimeException("Hôm nay nhân viên này không có lịch làm việc!");
        }

        // Tìm ca phù hợp (cho phép sớm/trễ 30p)
        WorkSchedule currentSchedule = null;
        for (WorkSchedule sch : todaySchedules) {
            LocalTime start = sch.getStartTime().toLocalTime().minusMinutes(30);
            LocalTime end = sch.getEndTime().toLocalTime().plusMinutes(30);

            if (currentTime.isAfter(start) && currentTime.isBefore(end)) {
                currentSchedule = sch;
                break;
            }
        }

        if (currentSchedule == null) {
            throw new RuntimeException("Không tìm thấy ca làm việc phù hợp vào giờ này!");
        }

        // Logic check-in/check-out
        Optional<Attendance> existingAtt = attendanceRepository.findByScheduleId(currentSchedule.getId());

        if (existingAtt.isPresent()) {
            return "CONFIRM_CHECKOUT";
        } else {
            Attendance newAtt = new Attendance();
            newAtt.setUser(currentSchedule.getUser());
            newAtt.setSchedule(currentSchedule);
            newAtt.setDate(today);
            newAtt.setCheckInTime(now);

            if (now.isAfter(currentSchedule.getStartTime())) {
                newAtt.setStatus("LATE");
                long minutesLate = ChronoUnit.MINUTES.between(currentSchedule.getStartTime(), now);
                newAtt.setLateMinutes((int) minutesLate);
            } else {
                newAtt.setStatus("PRESENT");
                newAtt.setLateMinutes(0);
            }

            attendanceRepository.save(newAtt);
            return "Check-in thành công cho: " + currentSchedule.getUser().getFullName();
        }
    }
}