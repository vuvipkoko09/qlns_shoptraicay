package com.example.quanlynhansu.controller;

import com.example.quanlynhansu.dto.LeaveRequestDTO;
import com.example.quanlynhansu.entity.LeaveRequest;
import com.example.quanlynhansu.mapper.LeaveRequestMapper;
import com.example.quanlynhansu.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveService;
    private final LeaveRequestMapper leaveMapper;

    // 1. Gửi đơn nghỉ phép
    @PostMapping("/create")
    public ResponseEntity<LeaveRequestDTO> create(@RequestParam Long userId, 
                                                  @RequestBody LeaveRequestDTO requestDTO) {
        // Map DTO sang Entity để xử lý logic
        LeaveRequest entityInput = leaveMapper.toEntity(requestDTO);
        
        LeaveRequest savedEntity = leaveService.createRequest(userId, entityInput);
        
        // Map ngược lại Entity sang DTO để trả về
        return ResponseEntity.ok(leaveMapper.toDTO(savedEntity));
    }

    // 2. Admin duyệt đơn
    @PutMapping("/approve/{id}")
    public ResponseEntity<LeaveRequestDTO> approve(@PathVariable Long id,
                                                   @RequestParam String status,
                                                   @RequestParam(required = false) String comment) {
        LeaveRequest updated = leaveService.approveRequest(id, status, comment);
        return ResponseEntity.ok(leaveMapper.toDTO(updated));
    }

    // 3. Xem lịch sử cá nhân
    @GetMapping("/my-history")
    public ResponseEntity<List<LeaveRequestDTO>> getMyHistory(@RequestParam Long userId) {
        List<LeaveRequest> list = leaveService.getHistory(userId);
        return ResponseEntity.ok(list.stream().map(leaveMapper::toDTO).collect(Collectors.toList()));
    }
    
    // 4. Admin xem tất cả
    @GetMapping("/all")
    public ResponseEntity<List<LeaveRequestDTO>> getAll() {
        List<LeaveRequest> list = leaveService.getAllRequests();
        return ResponseEntity.ok(list.stream().map(leaveMapper::toDTO).collect(Collectors.toList()));
    }
}