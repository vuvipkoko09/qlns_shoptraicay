package com.example.quanlynhansu.repository;

import com.example.quanlynhansu.entity.SalarySlip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalarySlipRepository extends JpaRepository<SalarySlip, Long> {
    Optional<SalarySlip> findByUserIdAndMonthAndYear(Long userId, Integer month, Integer year);
    List<SalarySlip> findByUserId(Long userId);
}