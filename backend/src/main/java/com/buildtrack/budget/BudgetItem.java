package com.buildtrack.budget;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "budgets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BudgetItem {
    @Id
    @Column(length = 64)
    private String category;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal budget;
}
