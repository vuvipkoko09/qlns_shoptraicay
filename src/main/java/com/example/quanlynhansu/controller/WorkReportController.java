package com.example.quanlynhansu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.quanlynhansu.dto.WorkReportDTO;
import com.example.quanlynhansu.entity.WorkReport;
import com.example.quanlynhansu.mapper.WorkReportMapper;
import com.example.quanlynhansu.service.WorkReportService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/work-reports")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkReportController {

    private final WorkReportService service;
    private final WorkReportMapper mapper;

    public WorkReportController(WorkReportService service, WorkReportMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    public WorkReportDTO create(@RequestBody WorkReportDTO dto) {
        WorkReport saved = service.create(mapper.toEntity(dto));
        return mapper.toDTO(saved);
    }

    @PutMapping("/{id}")
    public WorkReportDTO update(@PathVariable Long id, @RequestBody WorkReportDTO dto) {
        WorkReport saved = service.update(id, mapper.toEntity(dto));
        return mapper.toDTO(saved);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/{id}")
    public WorkReportDTO getById(@PathVariable Long id) {
        return mapper.toDTO(service.getById(id));
    }

    @GetMapping
    public List<WorkReportDTO> getAll() {
        return service.getAll()
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkReport>> getByUserId(@PathVariable Long userId) {
        List<WorkReport> reports = service.getByUserId(userId);
        return ResponseEntity.ok(reports);
    }
}
