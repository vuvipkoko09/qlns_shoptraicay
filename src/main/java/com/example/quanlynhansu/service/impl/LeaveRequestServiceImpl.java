package com.example.quanlynhansu.service.impl;

import com.example.quanlynhansu.entity.LeaveRequest;
import com.example.quanlynhansu.entity.User;
import com.example.quanlynhansu.repository.LeaveRequestRepository;
import com.example.quanlynhansu.repository.UserRepository;
import com.example.quanlynhansu.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRepo;
    private final UserRepository userRepo;

    @Override
    public LeaveRequest createRequest(Long userId, LeaveRequest requestData) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        requestData.setUser(user);
        requestData.setStatus("PENDING"); // Mặc định là Chờ duyệt
        return leaveRepo.save(requestData);
    }

    @Override
    public LeaveRequest approveRequest(Long requestId, String status, String adminComment) {
        LeaveRequest request = leaveRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        // Status chỉ nhận: APPROVED hoặc REJECTED
        request.setStatus(status);
        request.setAdminComment(adminComment);
        
        return leaveRepo.save(request);
    }

    @Override
    public List<LeaveRequest> getHistory(Long userId) {
        return leaveRepo.findByUserId(userId);
    }

    @Override
    public List<LeaveRequest> getAllRequests() {
        return leaveRepo.findAll();
    }
}