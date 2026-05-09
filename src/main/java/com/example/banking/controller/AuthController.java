package com.example.banking.controller;

import com.example.banking.dto.ApiResponse;
import com.example.banking.dto.AuthResponse;
import com.example.banking.dto.LoginRequest;
import com.example.banking.dto.RegisterRequest;
import com.example.banking.dto.TransferRequestDTO;
import com.example.banking.dto.TransferResponse;
import com.example.banking.entity.Account;
import com.example.banking.entity.Transaction;
import com.example.banking.entity.User;
import com.example.banking.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "User registered successfully", user));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.findByEmail(request.getEmail());
        String token = userService.login(request.getEmail(), request.getPassword());
        AuthResponse response = new AuthResponse(token, "Login successful", user.getEmail(), user.getName(), user.getRole());
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", response));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransferResponse>> transferMoney(@Valid @RequestBody TransferRequestDTO request, Principal principal) {
        // First ensure the sender matches the logged in user
        Account senderAcc = userService.getAccountByNumber(request.getSenderAccountNumber());
        userService.verifyUserOwnership(senderAcc.getUser().getEmail(), principal.getName());
        
        userService.transferMoney(request);
        Account senderAccount = userService.getAccountByNumber(request.getSenderAccountNumber());
        TransferResponse response = new TransferResponse("Transfer successful", senderAccount.getBalance(), null);
        return ResponseEntity.ok(new ApiResponse<>(true, "Transfer completed successfully", response));
    }

    @GetMapping("/transactions/{email}")
    public ResponseEntity<ApiResponse<List<Transaction>>> getTransactions(@PathVariable String email, Principal principal) {
        userService.verifyUserOwnership(email, principal.getName());
        List<Transaction> transactions = userService.getTransactionHistory(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Transactions retrieved successfully", transactions));
    }

    @GetMapping("/account/{email}")
    public ResponseEntity<ApiResponse<Account>> getAccount(@PathVariable String email, Principal principal) {
        userService.verifyUserOwnership(email, principal.getName());
        Account account = userService.getAccountDetails(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Account details retrieved", account));
    }

    @GetMapping("/test")
    public ResponseEntity<ApiResponse<String>> test() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Backend is working", "Backend Working"));
    }
}