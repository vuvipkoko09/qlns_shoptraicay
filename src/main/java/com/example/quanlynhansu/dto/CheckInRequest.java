package com.example.quanlynhansu.dto;
import lombok.Data;

@Data
public class CheckInRequest {
    private Double latitude; 
    private Double longitude;
    private String note;
}