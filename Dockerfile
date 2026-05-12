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

# Render needs the app to bind to 0.0.0.0
ENV SERVER_ADDRESS=0.0.0.0

# Optimize for 512MB RAM (Render Free Tier)
# -Xmx300m leaves enough room for the OS and JVM overhead
ENTRYPOINT ["java", "-Xmx300m", "-Xms256m", "-jar", "app.jar"]
