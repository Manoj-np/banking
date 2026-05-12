package com.example.banking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Value("${SPRING_DATASOURCE_URL:}")
    private String springDbUrl;

    @Value("${DATABASE_URL:}")
    private String renderDbUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:root}")
    private String username;

    @Value("${SPRING_DATASOURCE_PASSWORD:manoj}")
    private String password;

    @Value("${SPRING_DATASOURCE_DRIVER:com.mysql.cj.jdbc.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        String finalUrl = springDbUrl.isEmpty() ? renderDbUrl : springDbUrl;
        String finalDriver = driverClassName;

        // Auto-fix for Render's PostgreSQL URL
        if (finalUrl.startsWith("postgres://")) {
            finalUrl = finalUrl.replace("postgres://", "jdbc:postgresql://");
            finalDriver = "org.postgresql.Driver";
        } else if (finalUrl.startsWith("jdbc:postgresql://")) {
            finalDriver = "org.postgresql.Driver";
        } else if (finalUrl.startsWith("jdbc:mysql://")) {
            finalDriver = "com.mysql.cj.jdbc.Driver";
        }

        // If no URL is provided, fallback to local MySQL
        if (finalUrl.isEmpty()) {
            finalUrl = "jdbc:mysql://localhost:3306/paperless_bank?createDatabaseIfNotExist=true&useSSL=false";
        }

        System.out.println("🔌 Connecting to database at: " + finalUrl.split("@")[finalUrl.split("@").length - 1]);

        return DataSourceBuilder.create()
                .url(finalUrl)
                .username(username)
                .password(password)
                .driverClassName(finalDriver)
                .build();
    }
}
