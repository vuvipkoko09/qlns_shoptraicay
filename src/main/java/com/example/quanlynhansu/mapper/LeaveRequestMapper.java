package com.example.quanlynhansu.mapper;

import com.example.quanlynhansu.dto.LeaveRequestDTO;
import com.example.quanlynhansu.entity.LeaveRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LeaveRequestMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.fullName", target = "userName")
    LeaveRequestDTO toDTO(LeaveRequest entity);

    @Mapping(target = "user", ignore = true)
    LeaveRequest toEntity(LeaveRequestDTO dto);
}