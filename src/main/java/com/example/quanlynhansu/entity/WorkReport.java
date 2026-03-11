package com.example.quanlynhansu.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "schedule_id")
    private WorkSchedule schedule;
    private LocalDateTime reportDate;
    private String workDone;
    private String problems;
    private String notes;
    private String status;
    private Long actualAmount;
}