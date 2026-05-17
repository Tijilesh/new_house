package com.buildtrack.settings;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class ProjectSettingsController {

    private final ProjectSettingsRepository settingsRepository;

    @GetMapping
    public ProjectSettings getSettings() {
        return settingsRepository.findById(1L)
                .orElseGet(() -> {
                    ProjectSettings defaults = ProjectSettings.builder()
                            .id(1L)
                            .totalBudget(new BigDecimal("3500000.00"))
                            .projectName("My House")
                            .build();
                    return settingsRepository.save(defaults);
                });
    }

    @PutMapping
    public ProjectSettings updateSettings(@RequestBody ProjectSettings settingsDetails) {
        ProjectSettings settings = settingsRepository.findById(1L)
                .orElse(ProjectSettings.builder().id(1L).build());
        settings.setTotalBudget(settingsDetails.getTotalBudget());
        settings.setProjectName(settingsDetails.getProjectName());
        return settingsRepository.save(settings);
    }
}
