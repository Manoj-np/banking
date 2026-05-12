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
			// 1. Ensure Admin Exists
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
				account.setOverdraftLimit(10000.0);
				accountRepository.save(account);
				System.out.println("✅ Admin Seeded");
			}

			// 2. Ensure Alex Green (Wealthy Client) Exists
			if (userRepository.findByEmail("alex@paperless.com") == null) {
				User user1 = new User();
				user1.setName("Alex Green");
				user1.setEmail("alex@paperless.com");
				user1.setPassword(passwordEncoder.encode("user123"));
				user1.setTransactionPin(passwordEncoder.encode("1234"));
				user1.setRole("USER");
				userRepository.save(user1);

				Account acc1 = new Account();
				acc1.setUser(user1);
				acc1.setBalance(5420.50);
				acc1.setAccountNumber("PLB-ALEX-99");
				acc1.setOverdraftLimit(1000.0);
				accountRepository.save(acc1);
				System.out.println("✅ Alex Green Seeded");
			}

			// 3. Ensure Sarah Eco (Regular User) Exists
			if (userRepository.findByEmail("sarah@paperless.com") == null) {
				User user2 = new User();
				user2.setName("Sarah Eco");
				user2.setEmail("sarah@paperless.com");
				user2.setPassword(passwordEncoder.encode("user123"));
				user2.setTransactionPin(passwordEncoder.encode("1234"));
				user2.setRole("USER");
				userRepository.save(user2);

				Account acc2 = new Account();
				acc2.setUser(user2);
				acc2.setBalance(12850.00);
				acc2.setAccountNumber("PLB-SARA-01");
				acc2.setOverdraftLimit(500.0);
				accountRepository.save(acc2);
				System.out.println("✅ Sarah Eco Seeded");
			}
		};
	}
}
