package com.example.quanlynhansu.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.quanlynhansu.entity.WorkSchedule;

public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {
    List<WorkSchedule> findByUserId(Long userId);

    @Query("SELECT w FROM WorkSchedule w WHERE w.user.id = :userId AND w.startTime BETWEEN :start AND :end")
    List<WorkSchedule> findByUserIdAndDate(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
