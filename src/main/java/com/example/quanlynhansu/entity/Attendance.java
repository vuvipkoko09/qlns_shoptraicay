package com.example.quanlynhansu.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "schedule_id")
    private WorkSchedule schedule;

    private LocalDate date;

    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String status; 

    private Integer lateMinutes;
    private String note;
    
    private Integer earlyLeaveMinutes;
}