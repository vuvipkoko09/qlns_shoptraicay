package com.example.quanlynhansu.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.quanlynhansu.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameOrEmail(String username, String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);
}
