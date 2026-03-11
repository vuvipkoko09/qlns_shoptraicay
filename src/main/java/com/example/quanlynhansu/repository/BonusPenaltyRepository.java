package com.example.quanlynhansu.repository;

import com.example.quanlynhansu.entity.BonusPenalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BonusPenaltyRepository extends JpaRepository<BonusPenalty, Long> {
    List<BonusPenalty> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}