package com.example.quanlynhansu.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import com.example.quanlynhansu.entity.User;
import com.example.quanlynhansu.repository.UserRepository;
import com.example.quanlynhansu.service.UserService;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    // --- KHAI BÁO ĐƯỜNG DẪN CHUẨN ---
    private final String AVATAR_DIR = "D:\\quanlynhansu\\images\\users\\";
    private final String FACE_AI_DIR = "D:\\quanlynhansu\\FaceAI\\images\\";

    public UserServiceImpl(UserRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User create(User user) {
        if (repo.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username đã tồn tại!");
        }
        if (repo.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại!");
        }
        if (repo.findByPhone(user.getPhone()).isPresent()) {
            throw new RuntimeException("Số điện thoại này đã được sử dụng bởi nhân viên khác!");
        }
        validatePhoneAndBank(user.getPhone(), user.getBankAccount());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getActive() == null) {
            user.setActive(true);
        }
        return repo.save(user);
    }

    @Override
    public User update(Long id, User userDetails, MultipartFile file) {
        // Fix lỗi Null safety: Kiểm tra id khác null
        if (id == null)
            throw new RuntimeException("ID không được để trống");

        User existingUser = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user ID: " + id));

        validatePhoneAndBank(userDetails.getPhone(), userDetails.getBankAccount());

        existingUser.setFullName(userDetails.getFullName());
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setPhone(userDetails.getPhone());
        existingUser.setRole(userDetails.getRole());
        existingUser.setWorkType(userDetails.getWorkType());
        existingUser.setSalaryRate(userDetails.getSalaryRate());
        existingUser.setBankAccount(userDetails.getBankAccount());
        existingUser.setActive(userDetails.getActive());
        existingUser.setUsername(userDetails.getUsername()); // Cập nhật cả username nếu cần

        // Chỉ đổi mật khẩu nếu có nhập mới
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        // 2. XỬ LÝ ẢNH (Nếu có file gửi lên)
        if (file != null && !file.isEmpty()) {
            try {
                // A. Xử lý ảnh Avatar (Web)
                // Xóa ảnh cũ nếu có
                if (existingUser.getFileName() != null) {
                    try {
                        Files.deleteIfExists(Paths.get(AVATAR_DIR).resolve(existingUser.getFileName()));
                    } catch (IOException ignored) {
                    }
                }

                // Lưu ảnh mới vào thư mục Avatar
                String originalName = file.getOriginalFilename();
                String extension = (originalName != null && originalName.contains("."))
                        ? originalName.substring(originalName.lastIndexOf("."))
                        : ".jpg";
                String newAvatarName = UUID.randomUUID().toString() + extension;

                Path avatarPath = Paths.get(AVATAR_DIR);
                if (!Files.exists(avatarPath))
                    Files.createDirectories(avatarPath);
                Files.copy(file.getInputStream(), avatarPath.resolve(newAvatarName),
                        StandardCopyOption.REPLACE_EXISTING);

                existingUser.setFileName(newAvatarName); // Lưu tên file vào DB

                // B. Xử lý ảnh Face AI (Python)
                // Lưu vào thư mục FaceAI với tên là ID.jpg
                Path faceAiPath = Paths.get(FACE_AI_DIR);
                if (!Files.exists(faceAiPath))
                    Files.createDirectories(faceAiPath);

                String faceFileName = id + ".jpg"; // Quy ước tên file là ID
                Files.copy(file.getInputStream(), faceAiPath.resolve(faceFileName),
                        StandardCopyOption.REPLACE_EXISTING);

                // Gọi Python reload
                try {
                    RestTemplate restTemplate = new RestTemplate();
                    restTemplate.postForObject("http://localhost:5000/reload-faces", null, String.class);
                    System.out.println("✅ Đã gọi Python học lại khuôn mặt cho ID: " + id);
                } catch (Exception e) {
                    System.err.println("⚠️ Cảnh báo: Không gọi được Python reload: " + e.getMessage());
                }

            } catch (IOException e) {
                throw new RuntimeException("Lỗi lưu file ảnh: " + e.getMessage());
            }
        }

        return repo.save(existingUser);
    }

    @Override
    public void delete(Long id) {
        if (id != null) {
            repo.deleteById(id);
        }
    }

    @Override
    public User getById(Long id) {
        if (id == null)
            throw new RuntimeException("ID không được để trống");
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy User"));
    }

    @Override
    public List<User> getAll() {
        return repo.findAll();
    }

    @Override
    public String uploadImage(Long id, MultipartFile file) {
        return null; // Không dùng nữa
    }

    @Override
    public String uploadFaceImage(Long userId, MultipartFile file) {
        return null; // Không dùng nữa
    }

    private void validatePhoneAndBank(String phone, String bankAccount) {
        // Kiểm tra số điện thoại: Bắt đầu bằng 0, theo sau là 9 chữ số (Tổng 10 số)
        if (phone != null && !phone.matches("^0\\d{9}$")) {
            throw new RuntimeException("Số điện thoại không hợp lệ! (Phải có 10 số và bắt đầu bằng 0)");
        }
        if (bankAccount != null && !bankAccount.trim().isEmpty()) {
            // Chỉ kiểm tra regex khi người dùng CÓ nhập dữ liệu
            if (!bankAccount.matches("^\\d+$")) {
                throw new RuntimeException("Số tài khoản ngân hàng chỉ được chứa số!");
            }
        }
    }
}