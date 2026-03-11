package com.example.quanlynhansu.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkScheduleRequest {
    private List<Long> userIds;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String notes;
    private Long targetAmount;
    private String unit;
}