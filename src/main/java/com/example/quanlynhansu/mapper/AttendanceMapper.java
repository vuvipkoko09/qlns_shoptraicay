package com.example.quanlynhansu.mapper;

import com.example.quanlynhansu.dto.AttendanceDTO;
import com.example.quanlynhansu.entity.Attendance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AttendanceMapper {

    // Map từ Entity sang DTO
    @Mapping(source = "user.id", target = "userId")         // Lấy ID từ object User
    @Mapping(source = "user.fullName", target = "userName") // Lấy tên từ object User
    @Mapping(source = "schedule.id", target = "scheduleId") // Lấy ID từ object Schedule
    AttendanceDTO toDTO(Attendance entity);

    // Map từ DTO sang Entity (Ít dùng, thường dùng DTO request riêng)
    @Mapping(target = "user", ignore = true)     // Ignore vì sẽ set bằng ID sau
    @Mapping(target = "schedule", ignore = true)
    Attendance toEntity(AttendanceDTO dto);
}