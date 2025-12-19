# HillDevil Restaurant Management System

A comprehensive restaurant management system built with Spring Boot backend and React frontend, featuring real-time order management, analytics, and multi-branch support.

## 🏗️ Architecture

- **Backend**: Spring Boot 3.5.6 with Java 21
- **Frontend**: React 18 with TypeScript and Vite
- **Database**: PostgreSQL
- **Cache**: Redis
- **Payment**: PayOS integration
- **File Storage**: Cloudinary
- **Email**: Brevo API
- **Real-time**: Socket.IO

## 🚀 Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HillDevil
```

### 2. Environment Setup

Copy the example environment file and configure your values:

```bash
cp .env.example .env
```

Then edit `.env` with your actual configuration:

```bash
# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/your_database_name
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SIGNER_KEY=your_jwt_signing_key_here
JWT_ISSUER=your_domain.com

# PayOS Payment Gateway
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key

# Frontend Configuration
FRONTEND_BASE_URL=http://localhost:5000

# Cloudinary Configuration
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Email Configuration (Brevo)
BREVO_API_KEY=your_brevo_api_key
BREVO_MAIL_URL=https://api.brevo.com/v3/smtp/email

# Socket.IO Configuration
VITE_SOCKET_URL=http://localhost:8099
```

### 3. Run with Docker Compose

```bash
# Build and start the application
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

**⚠️ Security Note**: Make sure to update all default values in your `.env` file before running in production. Never commit your actual `.env` file to version control.

The application will be available at:
- **Frontend & Backend**: http://localhost:8080
- **Socket.IO**: http://localhost:8099

## 🛠️ Local Development Setup

### Prerequisites

- Java 21
- Node.js 22+
- PostgreSQL
- Redis
- Maven

### Backend Setup

```bash
cd backend

# Install dependencies
./mvnw dependency:resolve

# Run the application
./mvnw spring-boot:run
```

The backend will start on http://localhost:8080

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on http://localhost:5000

## 📁 Project Structure

```
HillDevil/
├── backend/                 # Spring Boot application
│   ├── src/main/java/      # Java source code
│   ├── src/main/resources/ # Configuration files
│   └── pom.xml             # Maven dependencies
├── frontend/               # React application
│   ├── src/                # TypeScript source code
│   ├── public/             # Static assets
│   └── package.json        # NPM dependencies
├── docker-compose.yml      # Docker orchestration
├── Dockerfile             # Multi-stage Docker build
└── .env                   # Environment variables
```

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/your_database` |
| `DB_USERNAME` | Database username | `your_db_user` |
| `DB_PASSWORD` | Database password | `your_secure_password` |
| `JWT_SIGNER_KEY` | JWT signing key (base64 encoded) | `your_base64_encoded_key` |
| `JWT_ISSUER` | JWT issuer domain | `your-domain.com` |
| `PAYOS_CLIENT_ID` | PayOS client ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `PAYOS_API_KEY` | PayOS API key | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `PAYOS_CHECKSUM_KEY` | PayOS checksum key | `your_payos_checksum_key` |
| `FRONTEND_BASE_URL` | Frontend URL | `http://localhost:5000` |
| `CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUD_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUD_API_SECRET` | Cloudinary API secret | `your_cloudinary_secret` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | `your_redis_password` |
| `BREVO_API_KEY` | Brevo email API key | `xkeysib-xxxxxxxxxxxxxxxx` |
| `BREVO_MAIL_URL` | Brevo API URL | `https://api.brevo.com/v3/smtp/email` |
| `VITE_SOCKET_URL` | Socket.IO server URL | `http://localhost:8099` |

## 🎯 Features

### Core Features
- **Multi-tenant Restaurant Management**: Support for multiple restaurants and branches
- **Real-time Order Management**: Live order tracking with Socket.IO
- **Menu Management**: Dynamic menu creation with categories and customizations
- **Table Management**: QR code generation for table ordering
- **Staff Management**: Role-based access control
- **Analytics & Reporting**: Comprehensive business intelligence

### Payment Integration
- **PayOS Integration**: Secure payment processing
- **Subscription Management**: Tiered pricing plans
- **Transaction History**: Complete payment tracking

### Advanced Features
- **Real-time Notifications**: Live updates for orders and payments
- **File Upload**: Cloudinary integration for images
- **Email Services**: Automated email notifications via Brevo
- **Caching**: Redis for improved performance
- **Database Migrations**: Liquibase for schema management

## 🔐 Security

- JWT-based authentication
- Role-based authorization (ADMIN, OWNER, STAFF, CUSTOMER)
- Password encryption with BCrypt
- CORS configuration for cross-origin requests

## 📊 API Documentation

The backend provides RESTful APIs for:
- Authentication (`/api/auth/*`)
- Restaurant management (`/api/restaurants/*`)
- Branch management (`/api/branches/*`)
- Menu management (`/api/menus/*`)
- Order management (`/api/orders/*`)
- Reports and analytics (`/api/reports/*`)
- Payment processing (`/api/payments/*`)

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📦 Deployment

### Docker Production Build

```bash
# Build production image
docker build -t hilldevil-app .

# Run production container
docker run -p 8080:8080 --env-file .env hilldevil-app
```

### Manual Deployment

1. **Backend**: Build JAR file with `./mvnw clean package`
2. **Frontend**: Build static files with `npm run build`
3. **Deploy**: The Dockerfile automatically includes frontend build in Spring Boot static resources

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Redis Connection Issues**
   - Verify Redis server is running
   - Check Redis configuration in `.env`

3. **Frontend Build Issues**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version (requires 22+)

4. **Docker Issues**
   - Ensure Docker daemon is running
   - Check port conflicts (8080, 8099)
   - Verify environment variables are set

### Support

For support and questions, please open an issue in the repository.