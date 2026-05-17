package com.buildtrack.expense;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseRepository expenseRepository;

    @GetMapping
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    @PostMapping
    public Expense createExpense(@RequestBody Expense expense) {
        return expenseRepository.save(expense);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expenseDetails) {
        return expenseRepository.findById(id)
                .map(expense -> {
                    expense.setDate(expenseDetails.getDate());
                    expense.setWorkStage(expenseDetails.getWorkStage());
                    expense.setCategory(expenseDetails.getCategory());
                    expense.setSubcategory(expenseDetails.getSubcategory());
                    expense.setShop(expenseDetails.getShop());
                    expense.setAmount(expenseDetails.getAmount());
                    expense.setPaymentMode(expenseDetails.getPaymentMode());
                    expense.setNotes(expenseDetails.getNotes());
                    expense.setPaid(expenseDetails.isPaid());
                    Expense updated = expenseRepository.save(expense);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        return expenseRepository.findById(id)
                .map(expense -> {
                    expenseRepository.delete(expense);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
