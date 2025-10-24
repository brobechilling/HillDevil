# HillDevil Project - GitHub Copilot Instructions

## Project Overview

**HillDevil** is a full-stack restaurant management system consisting of a Spring Boot backend and a React frontend. The system handles restaurant operations including table management, orders, reservations, subscriptions, and payments.

## Tech Stack

### Backend
- **Language**: Java 21
- **Framework**: Spring Boot 3.5.6
- **Database**: PostgreSQL (via JPA/Hibernate)
- **Security**: Spring Security with JWT (OAuth2 Resource Server)
- **Build Tool**: Maven
- **ORM**: Hibernate 6.6.x with JPA
- **Mapping**: MapStruct 1.5.5
- **Validation**: Jakarta Validation API
- **API Documentation**: (To be added - consider Swagger/OpenAPI)

### Frontend
- **Framework**: React.js
- **Package Manager**: npm
- **Language**: JavaScript/JSX

## Project Structure

```
/d:/FSOFT/Project/Backend/HillDevil/
├── backend/                    # Spring Boot Application
│   ├── src/main/java/com/example/backend/
│   │   ├── configuration/      # Security, CORS, JWT configs
│   │   ├── controller/         # REST API endpoints
│   │   ├── service/           # Business logic layer
│   │   ├── repository/        # JPA repositories (data access)
│   │   ├── entities/          # JPA entities (database models)
│   │   ├── dto/               # Data Transfer Objects
│   │   │   ├── request/       # Request DTOs
│   │   │   └── response/      # Response DTOs
│   │   ├── mapper/            # MapStruct mappers
│   │   ├── exception/         # Custom exceptions and handlers
│   │   └── utils/             # Utility classes
│   └── src/main/resources/
│       └── application.properties
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page-level components
│   │   ├── services/          # API service calls
│   │   ├── utils/             # Helper functions
│   │   └── assets/            # Static assets
│   └── package.json
└── README.md
```

## Code Conventions & Style Guide

### Java/Spring Boot

#### Naming Conventions
- **Classes**: PascalCase (e.g., `TableController`, `AreaTableRepository`)
- **Methods**: camelCase (e.g., `getTablesForOwner`, `updateTable`)
- **Variables**: camelCase (e.g., `ownerUserId`, `tableId`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `REFRESH_TOKEN_COOKIE`)
- **Packages**: lowercase (e.g., `com.example.backend.service`)

#### Architecture Patterns
- **Layered Architecture**: Controller → Service → Repository → Entity
- **DTOs**: Separate Request/Response DTOs for API contracts
- **Exception Handling**: Custom `AppException` with `ErrorCode` enum
- **Transaction Management**: `@Transactional` on service methods that modify data

#### Security
- **Authentication**: JWT-based with custom decoder (`MyCustomJwtDecoder`)
- **Authorization**: Role-based with `@PreAuthorize` annotations
- **Roles**: `OWNER`, `STAFF`, `CUSTOMER`
- **JWT Claims**: `user_id`, `sub`, `userId` (try multiple claims)

#### API Response Format
```java
public class ApiResponse<T> {
    private int code;
    private String message;
    private T result;
}
```

#### Error Handling
```java
public enum ErrorCode {
    USER_EXISTED(1001, "User already existed", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1004, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    // ... more error codes
}
```

### Database

#### Entity Conventions
- Use `@Entity` and `@Table` annotations
- Primary keys: `UUID` type with `@GeneratedValue(strategy = GenerationType.UUID)`
- Timestamps: `@CreationTimestamp` and `@UpdateTimestamp` for audit fields
- Enums: Store as `@Enumerated(EnumType.STRING)`
- Relationships: Use `@ManyToOne`, `@OneToMany` with appropriate `FetchType`

#### Repository Conventions
- Extend `JpaRepository<Entity, UUID>`
- Use `@Query` with JPQL for complex queries
- Constructor-based DTO projections: `new com.example.backend.dto.response.DTOName(...)`
- Named parameters: `@Param("paramName")`

### Frontend (React)

#### File Structure
- Components: PascalCase files (e.g., `Header.js`, `TableList.js`)
- Services: camelCase files (e.g., `tableService.js`, `authService.js`)
- Pages: PascalCase with `Page` suffix (e.g., `HomePage.js`, `TablesPage.js`)

## API Endpoints

### Authentication
- `POST /api/auth/token` - Login (returns access token + refresh token cookie)
- `POST /api/auth/refresh` - Refresh access token using cookie
- `POST /api/auth/logout` - Logout and revoke tokens

### Tables (Owner)
- `GET /api/owner/tables` - List tables with filters (paginated)
  - Query params: `branchId`, `areaId`, `status`, `minCapacity`, `page`, `size`, `sort`
- `PUT /api/owner/tables/{tableId}` - Update table details

### Subscriptions (Future)
- Package management
- Feature management
- Payment processing

## Development Workflow

### Backend Setup

1. **Prerequisites**
   - Java 21 (OpenJDK or Oracle JDK)
   - Maven 3.8+
   - PostgreSQL database

2. **Configuration**
   Edit `application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/hilldevil
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   jwt.signerKey=your-secret-key-here
   ```

3. **Build & Run**
   ```bash
   cd /d:/FSOFT/Project/Backend/HillDevil/backend
   mvn clean install
   mvn spring-boot:run
   ```

4. **Run Tests**
   ```bash
   mvn test
   ```

5. **Clean Build**
   ```bash
   mvn clean compile
   # or
   rmdir /s /q target
   mvn clean install
   ```

### Frontend Setup

1. **Prerequisites**
   - Node.js 16+ and npm

2. **Install Dependencies**
   ```bash
   cd /d:/FSOFT/Project/Backend/HillDevil/frontend
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm start
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Testing Strategy

### Backend Testing
- **Unit Tests**: Test service logic in isolation
- **Integration Tests**: Test repository queries with test database
- **Test Naming**: `ClassNameTest.java` (e.g., `TableServiceTest.java`)
- **Assertions**: Use JUnit 5 and AssertJ

### Frontend Testing
- **Unit Tests**: Test components and utilities
- **Integration Tests**: Test API service calls
- **Tools**: Jest, React Testing Library

## Deployment

### Backend Deployment
1. Package application:
   ```bash
   mvn clean package -DskipTests
   ```
2. JAR file location: `target/backend-{version}.jar`
3. Run JAR:
   ```bash
   java -jar target/backend-{version}.jar
   ```

### Frontend Deployment
1. Build production bundle:
   ```bash
   npm run build
   ```
2. Deploy `build/` directory to web server (Nginx, Apache, or CDN)

### Docker (Future Enhancement)
- Create `Dockerfile` for backend and frontend
- Use `docker-compose.yml` for multi-container setup

## Environment Variables

### Backend
- `JWT_SIGNER_KEY`: Secret key for JWT signing
- `DB_URL`: Database connection URL
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password

### Frontend
- `REACT_APP_API_URL`: Backend API base URL

## Common Issues & Solutions

### Backend

1. **ClassNotFoundException: AuthenticationRequest**
   - Solution: Run `mvn clean install` to recompile
   - Delete `target/` folder and rebuild

2. **JWT user_id claim is null**
   - Check JWT token at https://jwt.io
   - Verify claim names in `TableController.extractOwnerUserId()`
   - Ensure authentication service sets `user_id` claim

3. **Hibernate query errors**
   - Verify DTO constructor matches query projection order
   - Check entity relationships and `FetchType`
   - Use `@Transactional` for lazy-loaded collections

### Frontend

1. **CORS errors**
   - Verify CORS configuration in backend `SecurityConfig`
   - Check `allowedOrigins` includes frontend URL

2. **API 401 Unauthorized**
   - Verify JWT token in Authorization header: `Bearer {token}`
   - Check token expiration
   - Refresh token if expired

## Code Generation Guidelines for Copilot

When generating code for this project:

1. **Follow existing patterns**: Look at similar files in the codebase
2. **Use project conventions**: Match naming, structure, and style
3. **Add logging**: Use SLF4J logger with appropriate log levels
4. **Include validation**: Add `@Valid`, null checks, and business rule validation
5. **Handle exceptions**: Use custom `AppException` with `ErrorCode`
6. **Document complex logic**: Add JavaDoc for public methods
7. **Use DTOs**: Never expose entities directly in controllers
8. **Secure endpoints**: Add `@PreAuthorize` for protected endpoints
9. **Paginate lists**: Use `Pageable` and `Page` for list endpoints
10. **Transaction boundaries**: Add `@Transactional` on write operations

## Additional Notes

- **Primary keys**: All entities use `UUID` instead of `Long`
- **Timestamps**: Use `Instant` type for all timestamp fields
- **Enum storage**: Store as `STRING` not `ORDINAL`
- **Lazy loading**: Be careful with lazy-loaded relationships outside transactions
- **DTO mapping**: Use MapStruct where possible, manual mapping for complex cases
- **API versioning**: Currently using `/api/` prefix (consider `/api/v1/` in future)

## Future Enhancements

- [ ] Add Swagger/OpenAPI documentation
- [ ] Implement rate limiting
- [ ] Add caching layer (Redis)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add Docker support
- [ ] Implement WebSocket for real-time updates
- [ ] Add file upload for QR codes
- [ ] Implement audit logging
- [ ] Add metrics and monitoring (Actuator, Prometheus)

---

**Last Updated**: 2025-10-21  
**Maintainer**: HillDevil Development Team