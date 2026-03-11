package com.example.quanlynhansu.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Tắt CSRF để gọi API dễ dàng
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Cho phép login không cần token
                .anyRequest().permitAll() // TẠM THỜI: Cho phép tất cả để bạn test Frontend trước
                // Sau này khi làm xong Frontend login, đổi dòng trên thành: .anyRequest().authenticated()
            );
        
        return http.build();
    }
    @Bean   
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}