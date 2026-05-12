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
        String finalUser = username;
        String finalPass = password;

        try {
            if (finalUrl != null && (finalUrl.startsWith("postgres://") || finalUrl.startsWith("postgresql://"))) {
                java.net.URI uri = new java.net.URI(finalUrl);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    finalUser = userInfo.split(":", 2)[0];
                    finalPass = userInfo.split(":", 2)[1];
                }
                // Add sslmode=require for Render Postgres
                String query = uri.getQuery();
                String sslSuffix = (query == null || !query.contains("sslmode")) ? "?sslmode=require" : "";
                finalUrl = "jdbc:postgresql://" + uri.getHost() + (uri.getPort() != -1 ? ":" + uri.getPort() : "") + uri.getPath() + sslSuffix;
                finalDriver = "org.postgresql.Driver";
                
                // Set dialect for Hibernate
                System.setProperty("spring.jpa.properties.hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
            } else if (finalUrl != null && finalUrl.startsWith("jdbc:postgresql://")) {
                finalDriver = "org.postgresql.Driver";
                System.setProperty("spring.jpa.properties.hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
            }
        } catch (Exception e) {
            System.err.println("❌ Error parsing Database URL: " + e.getMessage());
        }

        // If no URL is provided, fallback to local MySQL
        if (finalUrl == null || finalUrl.isEmpty()) {
            finalUrl = "jdbc:mysql://localhost:3306/paperless_bank?createDatabaseIfNotExist=true&useSSL=false";
        }

        System.out.println("🔌 Connecting to: " + finalUrl);

        return DataSourceBuilder.create()
                .url(finalUrl)
                .username(finalUser)
                .password(finalPass)
                .driverClassName(finalDriver)
                .build();
    }
}
