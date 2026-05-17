package com.buildtrack.workstage;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "work_stages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class WorkStage {
    @Id
    @Column(length = 64)
    private String name;
}
