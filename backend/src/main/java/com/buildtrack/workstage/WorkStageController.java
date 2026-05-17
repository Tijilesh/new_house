package com.buildtrack.workstage;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/work-stages")
@RequiredArgsConstructor
public class WorkStageController {

    private final WorkStageRepository workStageRepository;

    @GetMapping
    public List<String> getWorkStages() {
        return workStageRepository.findAll().stream()
                .map(WorkStage::getName)
                .collect(Collectors.toList());
    }

    @PutMapping
    public List<String> saveWorkStages(@RequestBody List<String> names) {
        workStageRepository.deleteAllInBatch();
        List<WorkStage> stages = names.stream()
                .map(WorkStage::new)
                .collect(Collectors.toList());
        workStageRepository.saveAll(stages);
        return names;
    }
}
