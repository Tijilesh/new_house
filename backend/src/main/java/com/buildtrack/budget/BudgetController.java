package com.buildtrack.budget;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetRepository budgetRepository;

    @GetMapping
    public List<BudgetItem> getAllBudgets() {
        return budgetRepository.findAll();
    }

    @PutMapping
    public List<BudgetItem> saveBudgets(@RequestBody List<BudgetItem> items) {
        return budgetRepository.saveAll(items);
    }

    @DeleteMapping("/{category}")
    public ResponseEntity<Void> deleteBudget(@PathVariable String category) {
        if (budgetRepository.existsById(category)) {
            budgetRepository.deleteById(category);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
