package com.example.quanlynhansu.service;

import com.example.quanlynhansu.entity.WorkReport;

import java.util.List;

public interface WorkReportService {
    WorkReport create(WorkReport report);
    WorkReport update(Long id, WorkReport report);
    void delete(Long id);
    WorkReport getById(Long id);
    List<WorkReport> getAll();
    List<WorkReport> getByUserId(Long userId);
}
