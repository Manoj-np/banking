package com.example.banking;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import com.example.banking.entity.User;
import com.example.banking.entity.Account;
import com.example.banking.repository.UserRepository;
import com.example.banking.repository.AccountRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class BankingApplication {

	public static void main(String[] args) {
		SpringApplication.run(BankingApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(UserRepository userRepository, AccountRepository accountRepository, BCryptPasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.findByEmail("admin@nexus.com") == null) {
				User admin = new User();
				admin.setName("System Admin");
				admin.setEmail("admin@nexus.com");
				admin.setPassword(passwordEncoder.encode("admin123"));
				admin.setTransactionPin(passwordEncoder.encode("0000"));
				admin.setRole("ADMIN");
				userRepository.save(admin);

				Account account = new Account();
				account.setUser(admin);
				account.setBalance(1000000.0);
				account.setAccountNumber("ADMIN-001");
				accountRepository.save(account);
				
				System.out.println("Default admin user created: admin@nexus.com / admin123");
			}
		};
	}
}
