package com.example.quanlynhansu.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WorkScheduleDTO {
    private Long id;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long userId; 
    private String notes;
    private Integer targetAmount; 
    private String unit;
}
