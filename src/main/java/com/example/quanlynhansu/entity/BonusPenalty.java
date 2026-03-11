package com.example.quanlynhansu.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "bonus_penalties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BonusPenalty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Double amount; // > 0: Thưởng, < 0: Phạt
    private String reason;
    private LocalDate date;
}