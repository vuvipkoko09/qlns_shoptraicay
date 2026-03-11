package com.example.quanlynhansu.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String fullName;
    private String username;    
    private String email;
    private String phone;
    private String role;
    private String password;
    private String workType;
    private Double salaryRate;   
    private Boolean active;     
    private String bankAccount;
    private String fileName;
}
