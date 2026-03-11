package com.example.quanlynhansu.controller;

import com.example.quanlynhansu.dto.SalarySlipDTO;
import com.example.quanlynhansu.entity.SalarySlip;
import com.example.quanlynhansu.mapper.SalarySlipMapper;
import com.example.quanlynhansu.service.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/salary")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryService salaryService;
    private final SalarySlipMapper salaryMapper;

    // 1. Tính lương
    @PostMapping("/calculate")
    public ResponseEntity<SalarySlipDTO> calculate(@RequestParam Long userId,
                                                   @RequestParam int month,
                                                   @RequestParam int year) {
        SalarySlip slip = salaryService.calculateSalary(userId, month, year);
        return ResponseEntity.ok(salaryMapper.toDTO(slip));
    }

    // 2. Xem lịch sử lương
    @GetMapping("/history")
    public ResponseEntity<List<SalarySlipDTO>> getHistory(@RequestParam Long userId) {
        List<SalarySlip> list = salaryService.getSalaryHistory(userId);
        
        List<SalarySlipDTO> dtoList = list.stream()
                .map(salaryMapper::toDTO)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtoList);
    }
}