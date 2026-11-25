package com.example.banking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

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
        String finalUrl = (springDbUrl != null && !springDbUrl.isEmpty()) ? springDbUrl : renderDbUrl;
        String finalDriver = driverClassName;
        String finalUser = username;
        String finalPass = password;

        try {
            if (finalUrl != null && (finalUrl.startsWith("postgres://") || finalUrl.startsWith("postgresql://"))) {
                URI uri = new URI(finalUrl);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    finalUser = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
                    finalPass = URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
                }

                // Preserve existing query params; use sslmode=prefer so both Render Internal and External Postgres work
                String query = uri.getQuery();
                String queryString;
                if (query == null || query.isEmpty()) {
                    queryString = "?sslmode=prefer";
                } else if (!query.contains("sslmode=")) {
                    queryString = "?" + query + "&sslmode=prefer";
                } else {
                    queryString = "?" + query;
                }

                finalUrl = "jdbc:postgresql://" + uri.getHost()
                        + (uri.getPort() != -1 ? ":" + uri.getPort() : "")
                        + uri.getPath()
                        + queryString;
                finalDriver = "org.postgresql.Driver";
            } else if (finalUrl != null && finalUrl.startsWith("jdbc:postgresql://")) {
                finalDriver = "org.postgresql.Driver";
            } else if (finalUrl != null && finalUrl.startsWith("jdbc:h2:")) {
                finalDriver = "org.h2.Driver";
            } else if (finalUrl != null && finalUrl.startsWith("jdbc:mysql://")) {
                finalDriver = "com.mysql.cj.jdbc.Driver";
            }
        } catch (Exception e) {
            System.err.println("❌ Error parsing Database URL: " + e.getMessage());
        }

        // Fallback to local MySQL if no URL is provided
        if (finalUrl == null || finalUrl.isEmpty()) {
            finalUrl = "jdbc:mysql://localhost:3306/paperless_bank?createDatabaseIfNotExist=true&useSSL=false";
            finalDriver = "com.mysql.cj.jdbc.Driver";
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
