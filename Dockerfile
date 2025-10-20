# Stage 1: Build React frontend
FROM node:22 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build


# Stage 2: Build Spring Boot backend
FROM eclipse-temurin:21.0.2_13-jdk-jammy AS backend-builder
WORKDIR /app
COPY backend/.mvn .mvn
COPY backend/mvnw backend/pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY backend/src ./src
# Copy frontend build output to static resources
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static
RUN ./mvnw clean package -DskipTests


# Stage 3: Runtime
FROM eclipse-temurin:21.0.2_13-jre-jammy
WORKDIR /app
COPY --from=backend-builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
