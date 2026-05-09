package com.example.banking.dto;

public class TransferResponse {
    private String message;
    private Double newBalance;
    private String transactionId;

    public TransferResponse(String message, Double newBalance, String transactionId) {
        this.message = message;
        this.newBalance = newBalance;
        this.transactionId = transactionId;
    }

    public String getMessage() {
        return message;
    }

    public Double getNewBalance() {
        return newBalance;
    }

    public String getTransactionId() {
        return transactionId;
    }
}
