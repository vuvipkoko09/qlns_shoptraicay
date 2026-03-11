package com.example.quanlynhansu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.MediaType; 
import com.example.quanlynhansu.dto.UserDTO;
import com.example.quanlynhansu.entity.User;
import com.example.quanlynhansu.mapper.UserMapper;
import com.example.quanlynhansu.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService service;
    private final UserMapper mapper;

    public UserController(UserService service, UserMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    public UserDTO create(@RequestBody UserDTO dto) {
        User saved = service.create(mapper.toEntity(dto));
        return mapper.toDTO(saved);
    }
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @ModelAttribute UserDTO dto,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            // Gọi hàm update mới trong service
            User saved = service.update(id, mapper.toEntity(dto), file);
            return ResponseEntity.ok(mapper.toDTO(saved));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/{id}")
    public UserDTO getById(@PathVariable Long id) {
        return mapper.toDTO(service.getById(id));
    }

    @GetMapping
    public List<UserDTO> getAll() {
        return service.getAll()
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<?> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            // Gọi service để xử lý toàn bộ logic
            String newFileName = service.uploadImage(id, file);

            return ResponseEntity.ok(newFileName);
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/upload-face")
    public ResponseEntity<?> uploadFaceImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            // Controller chỉ gọi Service, không tự xử lý
            String message = service.uploadFaceImage(id, file);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
