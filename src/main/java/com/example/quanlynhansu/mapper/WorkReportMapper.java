package com.example.quanlynhansu.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.quanlynhansu.dto.WorkReportDTO;
import com.example.quanlynhansu.entity.User;
import com.example.quanlynhansu.entity.WorkReport;
import com.example.quanlynhansu.entity.WorkSchedule;

@Mapper(componentModel = "spring")
public interface WorkReportMapper {

    @Mapping(source = "user.id", target = "userId")       
    @Mapping(source = "schedule.id", target = "scheduleId")
    WorkReportDTO toDTO(WorkReport entity);

    @Mapping(source = "userId", target = "user.id")     
    @Mapping(source = "scheduleId", target = "schedule.id") 
    WorkReport toEntity(WorkReportDTO dto);

}
