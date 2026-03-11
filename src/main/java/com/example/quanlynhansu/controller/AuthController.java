package com.example.quanlynhansu.controller;

import com.example.quanlynhansu.dto.LoginRequest;
import com.example.quanlynhansu.dto.LoginResponse;
import com.example.quanlynhansu.dto.ResetPasswordRequest;
import com.example.quanlynhansu.entity.User;
import com.example.quanlynhansu.repository.UserRepository;
import com.example.quanlynhansu.util.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // Import cái này
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepo;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    // 2. Thêm vào Constructor
    public AuthController(UserRepository userRepo, JwtUtils jwtUtils, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        String input = loginRequest.getAccount();

        Optional<User> userOptional = userRepo.findByUsernameOrEmail(input, input);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // 1. KIỂM TRA MẬT KHẨU
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {

                // 2. KIỂM TRA TRẠNG THÁI ACTIVE (QUAN TRỌNG)
                // Hàm isEnabled() này chính là hàm chúng ta vừa viết trong Entity User
                if (!user.isEnabled()) {
                    return ResponseEntity.status(403).body("Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động!");
                }

                // Nếu mọi thứ OK -> Tạo token
                String token = jwtUtils.generateToken(user.getUsername());
                return ResponseEntity.ok(new LoginResponse(token, user.getRole(), user.getId(), user.getFullName()));
            }
        }

        return ResponseEntity.status(401).body("Sai tài khoản hoặc mật khẩu!");
    }
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        // 1. Tìm user theo username
        Optional<User> userOptional = userRepo.findByUsername(request.getUsername());

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Không tìm thấy tên đăng nhập này!");
        }

        User user = userOptional.get();

        // 2. Kiểm tra xem Email nhập vào có khớp với Email trong DB của user đó không
        // (Đây là bước xác minh danh tính đơn giản thay vì gửi mail)
        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email không khớp với tài khoản này!");
        }

        // 3. Nếu khớp thông tin -> Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);

        return ResponseEntity.ok("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
    }
}