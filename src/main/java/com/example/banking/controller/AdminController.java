package com.example.banking.controller;

import com.example.banking.dto.ApiResponse;
import com.example.banking.dto.DepositRequest;
import com.example.banking.dto.WithdrawRequest;
import com.example.banking.entity.Account;
import com.example.banking.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    @Autowired
    private UserService userService;

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<Account>> deposit(@Valid @RequestBody DepositRequest request, java.security.Principal principal) {
        Account account = userService.deposit(request, principal.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Amount deposited successfully", account));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<Account>> withdraw(@Valid @RequestBody WithdrawRequest request, java.security.Principal principal) {
        Account account = userService.withdraw(request, principal.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Amount withdrawn successfully", account));
    }

    @GetMapping("/accounts")
    public ResponseEntity<ApiResponse<java.util.List<Account>>> getAllAccounts() {
        java.util.List<Account> accounts = userService.getAllAccounts();
        return ResponseEntity.ok(new ApiResponse<>(true, "Accounts retrieved successfully", accounts));
    }
}
