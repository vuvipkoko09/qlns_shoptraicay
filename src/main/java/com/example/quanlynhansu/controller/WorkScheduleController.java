package com.example.quanlynhansu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.quanlynhansu.dto.WorkScheduleDTO;
import com.example.quanlynhansu.dto.WorkScheduleRequest;
import com.example.quanlynhansu.entity.WorkSchedule;
import com.example.quanlynhansu.mapper.WorkScheduleMapper;
import com.example.quanlynhansu.service.WorkScheduleService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkScheduleController {

    private final WorkScheduleService service;
    private final WorkScheduleMapper mapper;

    public WorkScheduleController(WorkScheduleService service, WorkScheduleMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    public WorkScheduleDTO create(@RequestBody WorkScheduleDTO dto) {
        WorkSchedule saved = service.create(mapper.toEntity(dto));
        return mapper.toDTO(saved);
    }

    @PutMapping("/{id}")
    public WorkScheduleDTO update(@PathVariable Long id, @RequestBody WorkScheduleDTO dto) {
        WorkSchedule saved = service.update(id, mapper.toEntity(dto));
        return mapper.toDTO(saved);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/{id}")
    public WorkScheduleDTO getById(@PathVariable Long id) {
        return mapper.toDTO(service.getById(id));
    }

    @GetMapping
    public List<WorkScheduleDTO> getAll() {
        return service.getAll()
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkSchedule>> getByUserId(@PathVariable Long userId) {
        List<WorkSchedule> list = service.getSchedulesByUserId(userId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/group")
    public ResponseEntity<?> createGroupSchedule(@RequestBody WorkScheduleRequest request) {
        if (request.getUserIds() == null || request.getUserIds().isEmpty()) {
            return ResponseEntity.badRequest().body("Cần chọn ít nhất 1 nhân viên");
        }
        List<WorkSchedule> savedList = service.createMany(request);
        return ResponseEntity.ok(savedList);
    }
}
