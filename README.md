# Paperless Bank — Full-Stack Digital Banking Platform

A modern, full-stack digital banking application built with **Spring Boot 3 (Java 17)**, **React 19 (Vite)**, **Spring Security (JWT)**, and **MySQL / PostgreSQL**. Designed with a clean **"Digital Paper"** light-mode UI, atomic fund transfers protected by a 4-digit transaction PIN, role-based admin controls, and Dockerized cloud deployment.

> **Project Hub:** [github.com/Manoj-np/banking](https://github.com/Manoj-np/banking)  
> **Live Demo:** _Deploy with [`render.yaml`](./render.yaml) and paste your Render URL here (e.g., `https://paperless-bank.onrender.com`)_

---

## Demo Credentials (Auto-Seeded on Startup)

| Role | Name | Email | Password | Transaction PIN | Account Number | Starting Balance | Overdraft Limit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Client** | Alex Green | `alex@paperless.com` | `user123` | `1234` | `PLB-ALEX-99` | ₹5,420.50 | ₹1,000.00 |
| **Client** | Sarah Eco | `sarah@paperless.com` | `user123` | `1234` | `PLB-SARA-01` | ₹12,850.00 | ₹500.00 |
| **Admin** | System Admin | `admin@nexus.com` | `admin123` | `0000` | `ADMIN-001` | ₹1,000,000.00 | ₹10,000.00 |

---

## Key Features

- **Stateless JWT Authentication & RBAC:** Spring Security filter chain (`JwtAuthenticationFilter`) issuing signed JWTs on login and enforcing `USER` vs `ADMIN` role access (`/api/admin/**` restricted to `ROLE_ADMIN`).
- **Two-Layer Transfer Security:** Login credentials grant read access, while every fund transfer verifies the sender's ownership (`Principal`) and hashes/checks a separate **4-digit BCrypt Transaction PIN**.
- **Atomic Transactions & Overdraft Support:** `@Transactional` service logic (`UserService`) prevents partial debits/credits, validates daily transfer limits (₹100,000), enforces overdraft limits, and rolls back on failure.
- **Digital Ledger & Wealth Analytics:** Interactive React dashboard with balance overview, asset growth chart, security/efficiency insight cards, and real-time transaction history.
- **Admin Control Panel:** Dedicated `/admin` dashboard to inspect all client accounts and execute deposits or withdrawals.
- **Environment-Aware Persistence:** Automatically connects to **local MySQL** during development and switches to **PostgreSQL (`sslmode=require`)** when `DATABASE_URL` or `SPRING_DATASOURCE_URL` is provided in the cloud (`DataSourceConfig.java`).

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Java 17, Spring Boot 3.2.5, Spring Web, Spring Data JPA, Spring Security |
| **Authentication** | JWT (`io.jsonwebtoken:jjwt` 0.11.5), BCrypt password & PIN hashing |
| **Frontend** | React 19, React Router 7, Vite 8, custom CSS ("Digital Paper" theme) |
| **Database** | MySQL 8+ (local), PostgreSQL (cloud), H2 (runtime available) |
| **Deployment** | Multi-stage `Dockerfile` (Node 20 + Maven 3.9 + Temurin 17 JRE), Render Blueprint (`render.yaml`) |

---

## REST API Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Service health check (`{"status": "UP"}`) |
| `POST` | `/api/auth/register` | Public | Register user, hash password & PIN, create account |
| `POST` | `/api/auth/login` | Public | Authenticate user and return JWT |
| `GET` | `/api/auth/account/{email}` | Authenticated (Owner) | Fetch user's account balance and details |
| `GET` | `/api/auth/transactions/{email}` | Authenticated (Owner) | Fetch user's transaction history |
| `POST` | `/api/auth/transfer` | Authenticated (Owner + PIN) | Execute atomic transfer between accounts |
| `GET` | `/api/admin/accounts` | `ROLE_ADMIN` | List all client accounts |
| `POST` | `/api/admin/deposit` | `ROLE_ADMIN` | Credit funds to an account |
| `POST` | `/api/admin/withdraw` | `ROLE_ADMIN` | Debit funds from an account |

---

## Project Structure

```text
banking/
├── frontend/                  # React + Vite SPA (builds to src/main/resources/static)
│   └── src/pages/             # Login, Register, Dashboard, Transfer, Transactions, AdminDashboard
├── src/main/java/com/example/banking/
│   ├── config/                # SecurityConfig (JWT + CORS), DataSourceConfig (MySQL/Postgres)
│   ├── controller/            # AuthController, AccountController, AdminController, HealthController, SpaController
│   ├── dto/                   # Request/Response DTOs with Jakarta validation
│   ├── entity/                # User, Account, Transaction JPA entities
│   ├── exception/             # GlobalExceptionHandler & custom domain exceptions
│   ├── repository/            # Spring Data JPA repositories
│   ├── security/              # JwtUtil, JwtAuthenticationFilter, CustomUserDetailsService
│   └── service/               # UserService (@Transactional banking operations)
├── Dockerfile                 # Multi-stage build (React frontend + Spring Boot JAR)
├── render.yaml                # One-click Render Blueprint (Web Service + PostgreSQL)
└── DEPLOYMENT_GUIDE.md        # Cloud deployment walkthrough
```

---

## Running Locally

### Prerequisites
- **Java 17+**
- **MySQL Server** running on `localhost:3306` (default credentials in `application.properties`: `root` / `manoj`, database `paperless_bank` auto-created)
- **Node.js 20+** (only needed if editing the React frontend)

### Start the Application
```bash
# Build frontend (optional if static assets are already up to date)
cd frontend && npm install && npm run build && cd ..

# Run Spring Boot (serves both API and React UI on http://localhost:8080)
./mvnw spring-boot:run
```
On Windows PowerShell:
```powershell
.\mvnw.cmd spring-boot:run
```
Then open **[http://localhost:8080](http://localhost:8080)**.

---

## Cloud Deployment (Render Blueprint)

This repository includes [`render.yaml`](./render.yaml) and [`Dockerfile`](./Dockerfile) for one-click deployment on [Render](https://render.com):

1. Push this repository to GitHub.
2. In Render, click **New + → Blueprint** and select **`Manoj-np/banking`**.
3. Render automatically provisions a **PostgreSQL** database (`paperless-bank-db`), injects `DATABASE_URL` and a generated `JWT_SECRET`, builds the Docker image, and exposes your live HTTPS demo link.
