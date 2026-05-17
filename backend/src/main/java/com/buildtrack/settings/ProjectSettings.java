package com.buildtrack.settings;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectSettings {
    @Id
    @Builder.Default
    private Long id = 1L;

    @Column(name = "total_budget", precision = 14, scale = 2)
    private BigDecimal totalBudget;

    @Column(name = "project_name", length = 128)
    private String projectName;
}
