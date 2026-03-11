package com.example.quanlynhansu.service;

import com.example.quanlynhansu.entity.LeaveRequest;
import java.util.List;

public interface LeaveRequestService {
    // Nhân viên gửi đơn
    LeaveRequest createRequest(Long userId, LeaveRequest requestData);

    // Admin duyệt/từ chối
    LeaveRequest approveRequest(Long requestId, String status, String adminComment);

    // Xem lịch sử nghỉ phép của nhân viên
    List<LeaveRequest> getHistory(Long userId);

    // Lấy toàn bộ đơn (cho Admin xem để duyệt)
    List<LeaveRequest> getAllRequests();
}