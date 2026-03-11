package com.example.quanlynhansu.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "salary_slips")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalarySlip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Integer month;
    private Integer year;

    private Double totalWorkHours; 
    private Double baseSalary;    
    private Double totalBonus;
    private Double totalPenalty;
    private Double finalSalary;  
    private int totalDays;  


    // DRAFT, PAID
    private String status;
}