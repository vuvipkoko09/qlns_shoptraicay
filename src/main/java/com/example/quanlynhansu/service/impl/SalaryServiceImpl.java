package com.example.quanlynhansu.service.impl;

import com.example.quanlynhansu.entity.*;
import com.example.quanlynhansu.repository.*;
import com.example.quanlynhansu.service.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalaryServiceImpl implements SalaryService {

    private final SalarySlipRepository salaryRepo;
    private final AttendanceRepository attendanceRepo;
    private final UserRepository userRepo;
    private final BonusPenaltyRepository bonusRepo;

    @Override
    public SalarySlip calculateSalary(Long userId, int month, int year) {
        if (userId == null) {
            throw new RuntimeException("User ID không được để trống!");
        }
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Xác định ngày đầu tháng và cuối tháng
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        // 2. Lấy danh sách chấm công trong tháng
        List<Attendance> attendances = attendanceRepo.findByUserIdAndDateBetween(userId, startDate, endDate);

        // 3. Tính tổng giờ làm hoặc ngày công
        double totalHours = 0;
        int totalDays = 0;

        for (Attendance att : attendances) {
            // Chỉ tính những ngày có check-in VÀ check-out
            if (att.getCheckInTime() != null && att.getCheckOutTime() != null) {
                long minutes = ChronoUnit.MINUTES.between(att.getCheckInTime(), att.getCheckOutTime());
                totalHours += (double) minutes / 60; // Đổi ra giờ
                totalDays++;
            }
        }

        // 4. Lấy danh sách Thưởng/Phạt trong tháng
        List<BonusPenalty> bonuses = bonusRepo.findByUserIdAndDateBetween(userId, startDate, endDate);
        double totalBonus = 0;
        double totalPenalty = 0;

        for (BonusPenalty bp : bonuses) {
            if (bp.getAmount() >= 0) totalBonus += bp.getAmount();
            else totalPenalty += Math.abs(bp.getAmount()); // Lấy trị tuyệt đối của phạt
        }

        // 5. Tính lương thực nhận (Logic quan trọng)
        double baseSalary = user.getSalaryRate() != null ? user.getSalaryRate() : 0;
        double finalSalary = 0;

        if ("PART_TIME".equalsIgnoreCase(user.getWorkType())) {
            finalSalary = (totalHours * baseSalary) + totalBonus - totalPenalty;
        } else {
            double dailyRate = baseSalary / 26; 
            finalSalary = (dailyRate * totalDays) + totalBonus - totalPenalty;
        }
        SalarySlip slip = salaryRepo.findByUserIdAndMonthAndYear(userId, month, year)
                .orElse(new SalarySlip());

        slip.setUser(user);
        slip.setMonth(month);
        slip.setYear(year);
        slip.setTotalWorkHours(totalHours); 
        slip.setTotalDays(totalDays);
        slip.setBaseSalary(baseSalary);
        slip.setTotalBonus(totalBonus);
        slip.setTotalPenalty(totalPenalty);
        slip.setFinalSalary(finalSalary);
        slip.setStatus("DRAFT");

        return salaryRepo.save(slip);
    }

    @Override
    public List<SalarySlip> getSalaryHistory(Long userId) {
        return salaryRepo.findByUserId(userId);
    }
}