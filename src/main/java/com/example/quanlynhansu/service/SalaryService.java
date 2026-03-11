package com.example.quanlynhansu.service;

import com.example.quanlynhansu.entity.SalarySlip;
import java.util.List;

public interface SalaryService {
    // Tính lương cho 1 nhân viên trong tháng cụ thể
    SalarySlip calculateSalary(Long userId, int month, int year);

    // Xem lịch sử lương
    List<SalarySlip> getSalaryHistory(Long userId);
}