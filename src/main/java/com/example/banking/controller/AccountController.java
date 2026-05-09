package com.example.banking.controller;

import com.example.banking.dto.ApiResponse;
import com.example.banking.entity.Account;
import com.example.banking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
@CrossOrigin("*")
public class AccountController {

    @Autowired
    private UserService userService;

    @GetMapping("/{email}")
    public ResponseEntity<ApiResponse<Account>> getAccount(@PathVariable String email) {
        Account account = userService.getAccountDetails(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Account details retrieved successfully", account));
    }
}
