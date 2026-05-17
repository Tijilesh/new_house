package com.buildtrack.expense;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "work_stage", length = 64)
    private String workStage;

    @Column(length = 64)
    private String category;

    @Column(length = 128)
    private String subcategory;

    @Column(length = 128)
    private String shop;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_mode", length = 32)
    private String paymentMode;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private boolean paid = true;
}