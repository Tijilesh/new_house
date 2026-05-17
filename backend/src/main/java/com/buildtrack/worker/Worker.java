package com.buildtrack.worker;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "workers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Worker {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 128)
    private String name;

    @Column(length = 64)
    private String role;

    @Column(length = 20)
    private String phone;

    @Column(name = "daily_wage", precision = 10, scale = 2)
    private BigDecimal dailyWage;
}
