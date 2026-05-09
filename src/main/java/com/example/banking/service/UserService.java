package com.example.banking.service;

import com.example.banking.dto.RegisterRequest;
import com.example.banking.dto.TransferRequestDTO;
import com.example.banking.dto.DepositRequest;
import com.example.banking.dto.WithdrawRequest;
import com.example.banking.exception.*;
import com.example.banking.security.JwtUtil;
import com.example.banking.entity.Transaction;
import com.example.banking.repository.TransactionRepository;
import com.example.banking.entity.User;
import com.example.banking.repository.UserRepository;
import com.example.banking.entity.Account;
import com.example.banking.repository.AccountRepository;
import org.springframework.security.access.AccessDeniedException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private static final Double INITIAL_BALANCE = 1000.0;
    private static final Double TRANSFER_LIMIT = 100000.0;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public User register(RegisterRequest request) {
        logger.info("Registering new user with email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()) != null) {
            logger.warn("Registration failed: Email already exists - {}", request.getEmail());
            throw new DuplicateEmailException("Email already registered. Please use a different email.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setTransactionPin(passwordEncoder.encode(request.getPin()));
        user.setRole("USER");

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully with id: {}", savedUser.getId());

        // Create account for user
        Account account = new Account();
        account.setUser(savedUser);
        account.setBalance(INITIAL_BALANCE);
        account.setAccountNumber("ACC" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        accountRepository.save(account);
        logger.info("Account created for user: {} with account number: {}", savedUser.getId(), account.getAccountNumber());

        return savedUser;
    }

    public String login(String email, String password) {
        logger.info("Login attempt for email: {}", email);

        User user = userRepository.findByEmail(email);

        if (user == null) {
            logger.warn("Login failed: User not found - {}", email);
            throw new UserNotFoundException("User not found. Please register first.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            logger.warn("Login failed: Invalid password for user - {}", email);
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        String token = jwtUtil.generateToken(email);
        logger.info("User logged in successfully: {}", email);
        return token;
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UserNotFoundException("User not found.");
        }
        return user;
    }

    public String transferMoney(TransferRequestDTO request) {
        logger.info("Transfer request from: {} to: {} amount: {}", 
            request.getSenderAccountNumber(), request.getReceiverAccountNumber(), request.getAmount());

        // Validate transfer amount
        if (request.getAmount() <= 0) {
            throw new IllegalArgumentException("Transfer amount must be greater than zero.");
        }

        if (request.getAmount() > TRANSFER_LIMIT) {
            throw new IllegalArgumentException("Transfer amount exceeds daily limit of " + TRANSFER_LIMIT);
        }

        // Check if sender and receiver are different
        if (request.getSenderAccountNumber().equals(request.getReceiverAccountNumber())) {
            throw new IllegalArgumentException("Cannot transfer to the same account.");
        }

        Account senderAccount = accountRepository.findByAccountNumber(request.getSenderAccountNumber());
        Account receiverAccount = accountRepository.findByAccountNumber(request.getReceiverAccountNumber());

        if (senderAccount == null) {
            logger.warn("Transfer failed: Sender account not found - {}", request.getSenderAccountNumber());
            throw new UserNotFoundException("Sender account not found.");
        }

        if (receiverAccount == null) {
            logger.warn("Transfer failed: Receiver account not found - {}", request.getReceiverAccountNumber());
            throw new UserNotFoundException("Receiver account not found.");
        }

        // Verify Transaction PIN
        User sender = senderAccount.getUser();
        if (!passwordEncoder.matches(request.getPin(), sender.getTransactionPin())) {
            logger.warn("Transfer failed: Invalid PIN for account - {}", senderAccount.getAccountNumber());
            throw new InvalidCredentialsException("Invalid Transaction PIN.");
        }

        if (senderAccount.getBalance() < request.getAmount()) {
            logger.warn("Transfer failed: Insufficient balance for account - {}", senderAccount.getAccountNumber());
            throw new InsufficientBalanceException(
                "Insufficient balance. Current balance: " + senderAccount.getBalance()
            );
        }

        // Perform transfer
        senderAccount.setBalance(senderAccount.getBalance() - request.getAmount());
        receiverAccount.setBalance(receiverAccount.getBalance() + request.getAmount());

        accountRepository.save(senderAccount);
        accountRepository.save(receiverAccount);

        // Record transaction
        Transaction transaction = new Transaction();
        transaction.setSenderEmail(senderAccount.getUser().getEmail());
        transaction.setReceiverEmail(receiverAccount.getUser().getEmail());
        transaction.setSenderAccount(senderAccount.getAccountNumber());
        transaction.setReceiverAccount(receiverAccount.getAccountNumber());
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setStatus("SUCCESS");

        transactionRepository.save(transaction);
        logger.info("Transfer successful: {} -> {} amount: {}", 
            senderAccount.getAccountNumber(), receiverAccount.getAccountNumber(), request.getAmount());

        return "Transfer Successful";
    }

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionHistory(String email) {
        logger.info("Fetching transaction history for: {}", email);

        User user = userRepository.findByEmail(email);

        if (user == null) {
            logger.warn("Transaction history request failed: User not found - {}", email);
            throw new UserNotFoundException("User not found.");
        }

        Account account = accountRepository.findByUser(user);

        if (account == null) {
            throw new IllegalArgumentException("Account not found for user.");
        }

        List<Transaction> sentTransactions = 
            transactionRepository.findBySenderAccount(account.getAccountNumber());

        List<Transaction> receivedTransactions = 
            transactionRepository.findByReceiverAccount(account.getAccountNumber());

        List<Transaction> allTransactions = new ArrayList<>();
        allTransactions.addAll(sentTransactions);
        allTransactions.addAll(receivedTransactions);

        // Sort by creation date descending
        allTransactions.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        logger.info("Transaction history fetched for {}: {} transactions", email, allTransactions.size());
        return allTransactions;
    }

    @Transactional(readOnly = true)
    public Account getAccountDetails(String email) {
        logger.info("Fetching account details for: {}", email);

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new UserNotFoundException("User not found.");
        }

        Account account = accountRepository.findByUser(user);

        if (account == null) {
            throw new IllegalArgumentException("Account not found for user.");
        }

        return account;
    }

    @Transactional(readOnly = true)
    public Account getAccountByNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber);
        if (account == null) {
            throw new IllegalArgumentException("Account not found.");
        }
        return account;
    }

    public void verifyUserOwnership(String requestEmail, String authenticatedEmail) {
        if (!requestEmail.equalsIgnoreCase(authenticatedEmail)) {
            logger.warn("Security Alert: User {} tried to access data of {}", authenticatedEmail, requestEmail);
            throw new AccessDeniedException("You are not authorized to access this data.");
        }
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public Account deposit(DepositRequest request, String adminEmail) {
        logger.info("Admin {} deposit request for account: {} amount: {}", adminEmail, request.getAccountNumber(), request.getAmount());
        Account account = accountRepository.findByAccountNumber(request.getAccountNumber());
        if (account == null) throw new IllegalArgumentException("Account not found.");

        if (account.getUser().getEmail().equalsIgnoreCase(adminEmail)) {
            logger.warn("Security Alert: Admin {} tried to deposit into their own account", adminEmail);
            throw new AccessDeniedException("Administrators are not permitted to perform financial operations on their own accounts.");
        }

        account.setBalance(account.getBalance() + request.getAmount());
        accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setSenderEmail("ADMIN");
        transaction.setReceiverEmail(account.getUser().getEmail());
        transaction.setSenderAccount("CASH_DEPOSIT");
        transaction.setReceiverAccount(account.getAccountNumber());
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription() != null ? request.getDescription() : "Admin Deposit");
        transaction.setStatus("SUCCESS");
        transactionRepository.save(transaction);

        return account;
    }

    public Account withdraw(WithdrawRequest request, String adminEmail) {
        logger.info("Admin {} withdraw request for account: {} amount: {}", adminEmail, request.getAccountNumber(), request.getAmount());
        Account account = accountRepository.findByAccountNumber(request.getAccountNumber());
        if (account == null) throw new IllegalArgumentException("Account not found.");

        if (account.getUser().getEmail().equalsIgnoreCase(adminEmail)) {
            logger.warn("Security Alert: Admin {} tried to withdraw from their own account", adminEmail);
            throw new AccessDeniedException("Administrators are not permitted to perform financial operations on their own accounts.");
        }

        if (account.getBalance() < request.getAmount()) {
            throw new InsufficientBalanceException("Insufficient funds for withdrawal.");
        }

        account.setBalance(account.getBalance() - request.getAmount());
        accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setSenderEmail(account.getUser().getEmail());
        transaction.setReceiverEmail("ADMIN");
        transaction.setSenderAccount(account.getAccountNumber());
        transaction.setReceiverAccount("CASH_WITHDRAWAL");
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription() != null ? request.getDescription() : "Admin Withdrawal");
        transaction.setStatus("SUCCESS");
        transactionRepository.save(transaction);

        return account;
    }
}
