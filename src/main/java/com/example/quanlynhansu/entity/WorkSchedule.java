package com.example.quanlynhansu.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    private String title;     
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String notes;
    private Long targetAmount;  
    private String unit;          
    private String status;
}