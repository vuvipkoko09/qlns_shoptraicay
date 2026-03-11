package com.example.quanlynhansu.dto;
import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveRequestDTO {
    private Long id;
    private Long userId;
    private String userName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status;
    private String adminComment;
}