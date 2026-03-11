package com.example.quanlynhansu.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/users/**")
                .addResourceLocations("file:///D:/quanlynhansu/images/users/");
    }

    // 2. THÊM CẤU HÌNH CORS (Để sửa lỗi chặn kết nối)
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cho tất cả API
                .allowedOrigins("http://localhost:5173") // Cho phép Frontend React truy cập
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Cho phép các method này
                .allowedHeaders("*") // Cho phép mọi header
                .allowCredentials(true); // Cho phép gửi cookie/token nếu có
    }
}