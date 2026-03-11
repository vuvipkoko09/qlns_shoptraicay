package com.example.quanlynhansu.dto;
import lombok.Data;

@Data
public class SalarySlipDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Integer month;
    private Integer year;
    private Double totalWorkHours;
    private Double totalDays;
    private Double baseSalary;
    private Double totalBonus;
    private Double totalPenalty;
    private Double finalSalary;
    private String status;
}