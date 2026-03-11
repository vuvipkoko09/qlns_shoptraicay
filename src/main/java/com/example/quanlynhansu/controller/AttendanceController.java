package com.example.quanlynhansu.controller;

import com.example.quanlynhansu.dto.AttendanceDTO;
import com.example.quanlynhansu.dto.CheckInRequest;
import com.example.quanlynhansu.dto.FaceCheckInRequest;
import com.example.quanlynhansu.entity.Attendance;
import com.example.quanlynhansu.mapper.AttendanceMapper;
import com.example.quanlynhansu.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceMapper attendanceMapper; // Tiêm Mapper vào

    // 1. Check-in
    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(@RequestParam Long userId, @RequestBody CheckInRequest request) {
        try {
            Attendance attendance = attendanceService.checkIn(userId, request);
            return ResponseEntity.ok(attendanceMapper.toDTO(attendance)); // Map sang DTO
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Check-out
    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut(@RequestParam Long userId) {
        try {
            Attendance attendance = attendanceService.checkOut(userId);
            return ResponseEntity.ok(attendanceMapper.toDTO(attendance));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/today")
    public ResponseEntity<List<AttendanceDTO>> getTodayAttendance(@RequestParam Long userId) {
        // 1. Lấy danh sách Entity
        List<Attendance> todayList = attendanceService.getTodayList(userId);

        // 2. Convert sang DTO để trả về Frontend an toàn
        // (Giả sử mapper của bạn có hàm toDTOList, hoặc dùng stream)
        List<AttendanceDTO> dtoList = todayList.stream()
                .map(attendanceMapper::toDTO)
                .toList(); // Hoặc .collect(Collectors.toList()) nếu Java cũ

        return ResponseEntity.ok(dtoList);
    }

    // 4. Lịch sử chấm công (Trả về List DTO)
    @GetMapping("/history")
    public ResponseEntity<List<AttendanceDTO>> getHistory(
            @RequestParam Long userId,
            @RequestParam int month,
            @RequestParam int year) {
        List<AttendanceDTO> history = attendanceService.getAttendanceHistory(userId, month, year);

        return ResponseEntity.ok(history);
    }

    // 5 face check in
    @PostMapping("/face-checkin")
    public ResponseEntity<?> faceCheckIn(@RequestBody FaceCheckInRequest req) {
        try {
            // Gọi service xử lý logic chấm công
            String message = attendanceService.processFaceCheckIn(req.getUserId());
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}