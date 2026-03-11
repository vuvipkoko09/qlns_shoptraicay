package com.example.quanlynhansu.service;

import com.example.quanlynhansu.dto.WorkScheduleRequest;
import com.example.quanlynhansu.entity.WorkSchedule;

import java.util.List;

public interface WorkScheduleService {
    WorkSchedule create(WorkSchedule schedule);
    WorkSchedule update(Long id, WorkSchedule schedule);
    void delete(Long id);
    WorkSchedule getById(Long id);
    List<WorkSchedule> getAll();
    List<WorkSchedule> getSchedulesByUserId(Long userId);
    List<WorkSchedule> createMany(WorkScheduleRequest request);
}
