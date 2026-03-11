package com.example.quanlynhansu.service.impl;

import org.springframework.stereotype.Service;
import com.example.quanlynhansu.entity.WorkReport;
import com.example.quanlynhansu.repository.WorkReportRepository;
import com.example.quanlynhansu.service.WorkReportService;
import java.util.List;

@Service
public class WorkReportServiceImpl implements WorkReportService {

    private final WorkReportRepository repo;

    public WorkReportServiceImpl(WorkReportRepository repo) {
        this.repo = repo;
    }

    @Override
    public WorkReport create(WorkReport report) {
        // --- CHỐT CHẶN KIỂM TRA TRÙNG LẶP ---
        if (report.getSchedule() != null && report.getSchedule().getId() != null) {
            // Kiểm tra trong DB xem lịch này đã được báo cáo chưa
            boolean exists = repo.existsByScheduleId(report.getSchedule().getId());

            if (exists) {
                // Ném ra lỗi RuntimeException -> Controller sẽ bắt được và trả về 400 Bad
                // Request
                throw new RuntimeException("⛔ Lịch làm việc này ĐÃ ĐƯỢC BÁO CÁO rồi! Vui lòng kiểm tra lại lịch sử.");
            }
        }
        // -------------------------------------

        return repo.save(report);
    }

    @Override
    public WorkReport update(Long id, WorkReport report) {
        WorkReport old = repo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));

        // Cập nhật các trường cũ
        old.setSchedule(report.getSchedule());
        old.setUser(report.getUser());
        old.setReportDate(report.getReportDate());
        old.setWorkDone(report.getWorkDone());
        old.setProblems(report.getProblems());
        old.setNotes(report.getNotes());
        old.setStatus(report.getStatus());

        // --- THÊM MỚI: CẬP NHẬT SỐ LƯỢNG ---
        old.setActualAmount(report.getActualAmount());

        return repo.save(old);
    }

    @Override
    public void delete(Long id) {
        repo.deleteById(id);
    }

    @Override
    public WorkReport getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
    }

    @Override
    public List<WorkReport> getAll() {
        return repo.findAll();
    }
    @Override
    public List<WorkReport> getByUserId(Long userId) {
        return repo.findByUserId(userId);
    }
}