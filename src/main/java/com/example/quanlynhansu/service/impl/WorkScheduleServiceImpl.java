package com.example.quanlynhansu.service.impl;

import org.springframework.stereotype.Service;

import com.example.quanlynhansu.dto.WorkScheduleRequest;
import com.example.quanlynhansu.entity.User;
import com.example.quanlynhansu.entity.WorkSchedule;
import com.example.quanlynhansu.repository.UserRepository;
import com.example.quanlynhansu.repository.WorkScheduleRepository;
import com.example.quanlynhansu.service.WorkScheduleService;

import jakarta.transaction.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class WorkScheduleServiceImpl implements WorkScheduleService {

    private final WorkScheduleRepository repo;
    private final UserRepository userRepo;

    public WorkScheduleServiceImpl(WorkScheduleRepository repo, UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    @Override
    @Transactional 
    public List<WorkSchedule> createMany(WorkScheduleRequest request) {
        List<WorkSchedule> result = new ArrayList<>();

        // Tìm các user dựa trên list ID gửi lên
        List<User> users = userRepo.findAllById(request.getUserIds());

        for (User user : users) {
            WorkSchedule ws = new WorkSchedule();
            ws.setUser(user); // Gán từng user

            // Copy thông tin chung
            ws.setTitle(request.getTitle());
            ws.setStartTime(request.getStartTime());
            ws.setEndTime(request.getEndTime());
            ws.setNotes(request.getNotes());
            ws.setTargetAmount(request.getTargetAmount());
            ws.setUnit(request.getUnit());

            result.add(repo.save(ws));
        }
        return result;
    }

    @Override
    public WorkSchedule create(WorkSchedule schedule) {
        return repo.save(schedule);
    }

    @Override
    public WorkSchedule update(Long id, WorkSchedule data) {
        WorkSchedule old = repo.findById(id).orElseThrow();
        old.setUser(data.getUser());
        old.setTitle(data.getTitle());
        old.setStartTime(data.getStartTime());
        old.setEndTime(data.getEndTime());
        old.setNotes(data.getNotes());

        // --- THÊM MỚI ---
        old.setTargetAmount(data.getTargetAmount());
        old.setUnit(data.getUnit());

        return repo.save(old);
    }

    @Override
    public void delete(Long id) {
        repo.deleteById(id);
    }

    @Override
    public WorkSchedule getById(Long id) {
        return repo.findById(id).orElseThrow();
    }

    @Override
    public List<WorkSchedule> getAll() {
        return repo.findAll();
    }

    @Override
    public List<WorkSchedule> getSchedulesByUserId(Long userId) {
        return repo.findByUserId(userId);
    }
}
