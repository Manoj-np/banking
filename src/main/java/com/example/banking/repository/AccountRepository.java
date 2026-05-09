

package com.example.banking.repository;

import com.example.banking.entity.Account;
import com.example.banking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository
        extends JpaRepository<Account, Long> {

    Account findByUser(User user);
    Account findByAccountNumber(String accountNumber);
}