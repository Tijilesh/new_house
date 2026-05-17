package com.buildtrack.category;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public List<String> getCategories() {
        return categoryRepository.findAll().stream()
                .map(Category::getName)
                .collect(Collectors.toList());
    }

    @PutMapping
    public List<String> saveCategories(@RequestBody List<String> names) {
        categoryRepository.deleteAllInBatch();
        List<Category> categories = names.stream()
                .map(Category::new)
                .collect(Collectors.toList());
        categoryRepository.saveAll(categories);
        return names;
    }
}
