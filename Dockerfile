# --- Stage 1: Build Frontend ---
FROM node:20-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build Backend ---
FROM maven:3.9-eclipse-temurin-17-alpine as backend-build
WORKDIR /app
COPY pom.xml ./
# Pre-download dependencies to speed up builds
RUN mvn dependency:go-offline
COPY src ./src
# Copy the frontend build from Stage 1 into backend's static resources
COPY --from=frontend-build /app/src/main/resources/static ./src/main/resources/static
# Build the JAR (skipping tests for faster deployment)
RUN mvn package -DskipTests

# --- Stage 3: Runtime ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
# Render uses the PORT environment variable
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]
