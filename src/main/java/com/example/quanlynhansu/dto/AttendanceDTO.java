package com.example.quanlynhansu.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class AttendanceDTO {
    private Long id;
    private Long userId; 
    private String userName;
    private Long scheduleId;
    private LocalDate date;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String status;
    private Integer lateMinutes;
    private String note;
    private Integer earlyLeaveMinutes;
    private String scheduleTitle; 
    private LocalTime scheduleStartTime; 
    private LocalTime scheduleEndTime;
}