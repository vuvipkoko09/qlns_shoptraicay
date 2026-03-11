package com.example.quanlynhansu.service;

import com.example.quanlynhansu.dto.AttendanceDTO;
import com.example.quanlynhansu.dto.CheckInRequest;
import com.example.quanlynhansu.entity.Attendance;
import java.util.List;

public interface AttendanceService {

    /**
     * Xử lý hành động Check-in (Vào ca)
     * @param userId: ID nhân viên
     * @param request: Thông tin toạ độ, ghi chú
     * @return Bản ghi chấm công vừa tạo
     */
    Attendance checkIn(Long userId, CheckInRequest request);

    /**
     * Xử lý hành động Check-out (Tan ca)
     * @param userId: ID nhân viên
     * @return Bản ghi chấm công đã cập nhật giờ về
     */
    Attendance checkOut(Long userId);
   List<Attendance> getTodayList(Long userId);

    // --- THÊM DÒNG NÀY ĐỂ KHỚP VỚI CODE BẠN VỪA LÀM ---
    List<AttendanceDTO> getAttendanceHistory(Long userId, int month, int year);
    String processFaceCheckIn(Long userId);
}
