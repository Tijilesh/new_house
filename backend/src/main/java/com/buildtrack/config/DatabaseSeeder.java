package com.buildtrack.config;

import com.buildtrack.category.Category;
import com.buildtrack.category.CategoryRepository;
import com.buildtrack.settings.ProjectSettings;
import com.buildtrack.settings.ProjectSettingsRepository;
import com.buildtrack.user.AppUser;
import com.buildtrack.user.AppUserRepository;
import com.buildtrack.workstage.WorkStage;
import com.buildtrack.workstage.WorkStageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final WorkStageRepository workStageRepository;
    private final ProjectSettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed default user if empty
        if (userRepository.count() == 0) {
            AppUser admin = AppUser.builder()
                    .username(adminUsername)
                    .password(passwordEncoder.encode(adminPassword))
                    .role("ADMIN")
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded default admin user: " + adminUsername);
        }

        // 2. Seed default categories if empty
        if (categoryRepository.count() == 0) {
            List<String> defaultCats = List.of("Material", "Labour", "Interior", "Exterior", "One-Time", "Other");
            for (String cat : defaultCats) {
                categoryRepository.save(new Category(cat));
            }
            System.out.println("Seeded default categories.");
        }

        // 3. Seed default work stages if empty
        if (workStageRepository.count() == 0) {
            List<String> defaultStages = List.of(
                    "Foundation", "Plinth", "Walls", "Roofing", "Plastering",
                    "Flooring", "Electrical", "Plumbing", "Painting", "Finishing"
            );
            for (String stage : defaultStages) {
                workStageRepository.save(new WorkStage(stage));
            }
            System.out.println("Seeded default work stages.");
        }

        // 4. Seed default settings if empty
        if (settingsRepository.count() == 0) {
            ProjectSettings settings = ProjectSettings.builder()
                    .id(1L)
                    .projectName("My House")
                    .totalBudget(new BigDecimal("3500000.00"))
                    .build();
            settingsRepository.save(settings);
            System.out.println("Seeded default settings.");
        }
    }
}
