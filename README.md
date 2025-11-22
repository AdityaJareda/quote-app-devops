# Quote App - DevOps CI/CD Project

<!-- Status Badges -->
![CI/CD Pipeline](https://github.com/AdityaJareda/quote-app-devops/actions/workflows/ci-cd.yml/badge.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![Docker](https://img.shields.io/docker/pulls/adityajareda/quote-app?logo=docker)
![Docker Image Size](https://img.shields.io/docker/image-size/adityajareda/quote-app/latest?logo=docker)
![License](https://img.shields.io/badge/license-MIT-green)
![Tests](https://img.shields.io/badge/tests-14%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-yellowgreen)

> A full-stack random quote generator demonstrating modern DevOps practices including automated CI/CD pipelines, Docker containerization, security scanning, and comprehensive testing.

---

## Features

### User Features
- **Random Quote Generation** - Get inspired with motivational quotes
- **Category Filtering** - Browse quotes by category (motivation, life, wisdom, etc.)
- **Statistics Tracking** - View total quotes and personal viewing history
- **Share Functionality** - Copy quotes to clipboard or share via native API
- **Keyboard Shortcuts** - Space for new quote, 'S' to share
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### Technical Features
- **RESTful API** - Clean, documented endpoints
- **Fully Dockerized** - Multi-stage optimized build
- **CI/CD Pipeline** - Automated testing, building, and deployment
- **Security Scanning** - Automated vulnerability detection with Trivy
- **Comprehensive Testing** - 14 unit tests with 85%+ coverage
- **Multi-platform Support** - Built for amd64 and arm64 architectures
- **Health Checks** - Built-in monitoring and health endpoints

---

## Tech Stack

### Backend
- **Node.js 18.x** - Runtime environment
- **Express.js 4.18** - Web framework
- **RESTful API** - Standard HTTP methods

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox, Grid, and CSS Variables
- **Vanilla JavaScript (ES6+)** - No framework dependencies

### DevOps & Infrastructure
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD automation
- **Jest & Supertest** - Testing framework
- **Trivy** - Security vulnerability scanning
- **Docker Hub** - Image registry
- **Kubernetes** (upcoming) - Container orchestration

---

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git
- Docker (optional, for containerized deployment)

### Option 1: Run with Docker (Recommended)
```bash
# Pull and run from Docker Hub
docker run -p 3000:3000 adityajareda/quote-app:latest

# Access at http://localhost:3000
```

### Option 2: Run with Docker Compose
```bash
# Clone repository
git clone https://github.com/AdityaJareda/quote-app-devops.git
cd quote-app-devops

# Start with Docker Compose
docker compose up -d

# Access at http://localhost:3000
```

### Option 3: Local Development
```bash
# Clone repository
git clone https://github.com/AdityaJareda/quote-app-devops.git
cd quote-app-devops

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server (with auto-reload)
npm run dev

# Access at http://localhost:3000
```

---

## API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

| Method | Endpoint | Description | Example |
|--------|----------|-------------|---------|
| GET | `/health` | Health check | Returns server status |
| GET | `/api/quotes` | Get all quotes | Supports pagination (`?page=1&limit=10`) |
| GET | `/api/quotes/random` | Get random quote | Returns one random quote |
| GET | `/api/quotes/:id` | Get quote by ID | `/api/quotes/1` |
| GET | `/api/quotes/category/:category` | Filter by category | `/api/quotes/category/motivation` |
| GET | `/api/categories` | Get all categories | Returns list of available categories |
| POST | `/api/quotes` | Add new quote | Requires `text`, `author`, `category` |

### Example Request
```bash
curl http://localhost:3000/api/quotes/random
```

### Example Response
```json
{
  "id": 1,
  "text": "The only way to do great work is to love what you do.",
  "author": "Steve Jobs",
  "category": "motivation"
}
```

### Error Responses
```json
{
  "error": "Quote not found",
  "id": 999
}
```

---

## Testing

### Run Tests
```bash
# Run all tests with coverage
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

### Test Coverage

- **Statements:** 87.5%
- **Branches:** 75%
- **Functions:** 83.3%
- **Lines:** 87.5%

**14 passing tests** covering:
- Health check endpoint
- Quote retrieval (all, random, by ID, by category)
- Categories endpoint
- POST endpoint validation
- Error handling
- 404 handler

---

## Docker

### Multi-Stage Dockerfile

Our Dockerfile uses multi-stage builds for optimization:

**Stage 1: Builder**
- Installs all dependencies
- Runs tests (build fails if tests fail)
- Prepares application files

**Stage 2: Production**
- Minimal production image
- Only production dependencies
- Non-root user for security
- Health checks included

**Final Image Size:** ~150MB

### Build Locally
```bash
# Build image
docker build -t quote-app:local .

# Run container
docker run -d -p 3000:3000 --name my-quote-app quote-app:local

# View logs
docker logs -f my-quote-app

# Stop container
docker stop my-quote-app
```

### Docker Compose

**Production mode:**
```bash
docker compose up -d
```

**Development mode** (with live reload):
```bash
docker compose -f docker-compose.dev.yml up
```

### Environment Variables
```bash
# Run with custom environment
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e APP_NAME="My Quote App" \
  adityajareda/quote-app:latest
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Our automated pipeline runs on every push and pull request:
```
Code Push to GitHub
    |
    v
+---------------------------------------------------+
|  Stage 1: Test                                    |
|  - Setup Node.js 18                               |
|  - Install dependencies (npm ci)                  |
|  - Run Jest tests                                 |
|  - Generate coverage report                       |
+---------------------------------------------------+
    | (only if tests pass)
    v
+---------------------------------------------------+
|  Stage 2: Build & Push                            |
|  - Build Docker image (multi-stage)               |
|  - Tag with commit SHA and 'latest'               |
|  - Multi-platform build (amd64, arm64)            |
|  - Push to Docker Hub                             |
+---------------------------------------------------+
    |
    v
+---------------------------------------------------+
|  Stage 3: Security Scan                           |
|  - Run Trivy vulnerability scanner                |
|  - Generate SARIF report                          |
|  - Upload to GitHub Security tab                  |
+---------------------------------------------------+
    |
    v
+---------------------------------------------------+
|  Stage 4: Deployment Notification                 |
|  - Create deployment summary                      |
+---------------------------------------------------+
```

### Pipeline Features

- **Automated Testing** - Runs on every commit
- **Docker Build & Push** - Automatic image publishing
- **Security Scanning** - Trivy vulnerability detection
- **Multi-platform** - Builds for amd64 and arm64
- **Branch Protection** - Requires passing tests before merge
- **Status Badges** - Real-time build status
- **Deployment Summaries** - Detailed run reports

### View Pipeline Status

Check the [Actions tab](https://github.com/AdityaJareda/quote-app-devops/actions) to see:
- Build status
- Test results
- Security scan reports
- Deployment history

---

## Project Structure
```
quote-app-devops/
├── .github/
│   └── workflows/
│       ├── ci-cd.yml           # Main CI/CD pipeline
│       └── health-check.yml    # Scheduled health checks
├── src/
│   ├── app.js                  # Express server
│   ├── routes/                 # API route handlers
│   ├── controllers/            # Business logic
│   └── data/
│       └── quotes.json         # Quote database
├── public/
│   ├── index.html              # Frontend UI
│   ├── style.css               # Styling
│   └── script.js               # Frontend logic
├── tests/
│   └── app.test.js             # Unit tests (14 tests)
├── coverage/                   # Test coverage reports
├── docs/                       # Documentation
│   └── DOCKER.md               # Docker guide
├── .dockerignore               # Docker build exclusions
├── .env.example                # Environment template
├── .gitignore                  # Git exclusions
├── docker-compose.yml          # Production compose
├── docker-compose.dev.yml      # Development compose
├── Dockerfile                  # Multi-stage build
├── jest.config.js              # Test configuration
├── LICENSE                     # MIT License
├── package.json                # Node.js dependencies
└── README.md                   # This file
```

---

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment (`development`, `production`) | `development` | No |
| `APP_NAME` | Application name | `Quote App` | No |
| `APP_VERSION` | Application version | `1.0.0` | No |

### Example `.env` file
```env
PORT=3000
NODE_ENV=production
APP_NAME=Quote App
APP_VERSION=1.0.0
```

---

## Deployment

### Docker

```bash
# Pull latest image
docker pull adityajareda/quote-app:latest

# Run on server
docker run -d \
  --name quote-app \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  adityajareda/quote-app:latest
```

### Kubernetes

```bash
# Start Minikube (local development)
minikube start --driver=docker
minikube addons enable metrics-server

# Apply manifests
kubectl apply -f k8s/

# Check deployment
kubectl get all -n quote-app

# Access application
minikube service quote-app-service -n quote-app --url

# Or use port forwarding
kubectl port-forward -n quote-app service/quote-app-service 8080:80
```
**Features:**
- 3 replicas for high availability
- Horizontal Pod Autoscaler (2-10 pods based on CPU/memory)
- Health checks (liveness and readiness probes)
- Resource limits and requests
- ConfigMap for environment variables
- NodePort service for external access
- Rolling updates with zero downtime

See [k8s/README.md](k8s/README.md) for detailed Kubernetes documentation.

---

## Monitoring & Observability

### Health Checks

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "environment": "production",
  "quotesLoaded": 10
}
```

### Docker Health Check

Built-in Docker health check runs every 30 seconds:
```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' quote-app-container
```

### GitHub Security

View security scan results:
- Go to repository **Security** tab
- Click **Code scanning**
- View Trivy vulnerability reports

---

## Roadmap

### Completed
- [x] Full-stack application (Frontend + Backend)
- [x] RESTful API with 7 endpoints
- [x] Comprehensive unit tests (14 tests, 85%+ coverage)
- [x] Dockerization with multi-stage build
- [x] Docker Compose setup
- [x] Published to Docker Hub
- [x] GitHub Actions CI/CD pipeline
- [x] Automated security scanning
- [x] Branch protection rules
- [x] Multi-platform Docker builds

### In Progress
- [ ] Kubernetes deployment (Day 4)
- [ ] Horizontal Pod Autoscaler
- [ ] Ingress configuration

### Planned
- [ ] Terraform infrastructure as code
- [ ] Monitoring with Prometheus + Grafana
- [ ] Centralized logging with ELK stack
- [ ] Database integration (MongoDB)
- [ ] User authentication
- [ ] Rate limiting
- [ ] API documentation with Swagger
- [ ] Load testing with k6
- [ ] Blue-green deployment strategy

---

## Contributing

This is a learning project, but contributions are welcome!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test updates
- `ci:` - CI/CD changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Aditya Singh**

- GitHub: [@AdityaJareda](https://github.com/AdityaJareda)
- LinkedIn: [Aditya Singh](https://www.linkedin.com/in/adityajareda)

---

## Acknowledgments

- Built as part of my DevOps learning journey
- Inspired by modern DevOps best practices and industry standards
- Quote data sourced from public domain

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Express.js Guide](https://expressjs.com/)
- [Jest Testing Framework](https://jestjs.io/)
- [Docker Hub Repository](https://hub.docker.com/r/adityajareda/quote-app)

---

A small step toward mastering DevOps.
