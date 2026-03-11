package com.example.quanlynhansu.dto;

import lombok.Data;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

@Data
public class WorkReportDTO {
    private Long id;
    private Long scheduleId;
    private Long userId;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime reportDate;
    private String workDone;
    private String problems;
    private String notes;
    private String status;
    private Long actualAmount;
}
