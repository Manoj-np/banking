package com.example.banking.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping(value = { "/", "/login", "/register", "/dashboard", "/transfer", "/transactions", "/admin" })
    public String index() {
        return "forward:/index.html";
    }

    // This handles any other non-API routes for SPA compatibility
    @GetMapping("/{path:[^\\.]*}")
    public String redirect() {
        return "forward:/index.html";
    }
}
