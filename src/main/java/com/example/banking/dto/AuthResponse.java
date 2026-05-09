package com.example.banking.dto;

public class AuthResponse {
    private String token;
    private String message;
    private String email;
    private String name;
    private String role;

    public AuthResponse(String token, String message, String email, String name, String role) {
        this.token = token;
        this.message = message;
        this.email = email;
        this.name = name;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public String getMessage() {
        return message;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }
}
