package com.example.quanlynhansu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.quanlynhansu.entity.WorkReport;

public interface WorkReportRepository extends JpaRepository<WorkReport, Long> {

    boolean existsByScheduleId(Long scheduleId);


    List<WorkReport> findByUserId(Long userId);
}
