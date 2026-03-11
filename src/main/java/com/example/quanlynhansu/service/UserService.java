package com.example.quanlynhansu.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.example.quanlynhansu.entity.User;

public interface UserService {
    User create(User user);
    User update(Long id, User user, MultipartFile file);
    void delete(Long id);
    User getById(Long id);
    List<User> getAll();
    String uploadImage(Long id, MultipartFile file);
    String uploadFaceImage(Long userId, MultipartFile file);
}
