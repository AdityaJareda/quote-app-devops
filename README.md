# Quote App - DevOps CI/CD Project

A random quote generator web application built to demonstrate DevOps practices including CI/CD pipelines, containerization, and orchestration.

## Features

* Random quote generation
* Category-based filtering
* RESTful API backend
* Responsive frontend design
* Statistics tracking
* Share functionality

## Tech Stack

**Backend:**

* Node.js
* Express.js
* RESTful API

**Frontend:**

* HTML5
* CSS3 (with CSS Variables)
* Vanilla JavaScript (ES6+)

**DevOps Tools:**

* Docker
* Docker Compose
* GitHub Actions
* Kubernetes (Minikube)
* Terraform (planned)

## Prerequisites

* Node.js 18.x or higher
* npm 9.x or higher
* Git

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/AdityaJareda/quote-app-devops.git quote-app
cd quote-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file**

```bash
cp .env.example .env
```

4. **Start the server**

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

5. **Access the application**

* Frontend: [http://localhost:3000](http://localhost:3000)
* API Health: [http://localhost:3000/health](http://localhost:3000/health)

## API Endpoints

| Method | Endpoint                         | Description                |
| ------ | -------------------------------- | -------------------------- |
| GET    | `/health`                        | Health check               |
| GET    | `/api/quotes`                    | Get all quotes (paginated) |
| GET    | `/api/quotes/random`             | Get random quote           |
| GET    | `/api/quotes/:id`                | Get quote by ID            |
| GET    | `/api/quotes/category/:category` | Get quotes by category     |
| GET    | `/api/categories`                | Get all categories         |
| POST   | `/api/quotes`                    | Add new quote              |

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Check code quality
npm run lint
```

## Docker

```bash
# Build image
docker build -t quote-app .

# Run container
docker run -p 3000:3000 quote-app

# Using Docker Compose
docker-compose up
```

## Project Structure

```
quote-app/
├── src/
│   ├── app.js              # Main Express application
│   ├── routes/             # API routes
│   ├── controllers/        # Business logic
│   └── data/
│       └── quotes.json     # Quote data
├── public/
│   ├── index.html          # Frontend UI
│   ├── style.css           # Styles
│   └── script.js           # Frontend logic
├── tests/                  # Test files
├── .github/
│   └── workflows/          # CI/CD pipelines
├── k8s/                    # Kubernetes manifests
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Environment Variables

| Variable | Description | Default     |
| -------- | ----------- | ----------- |
| PORT     | Server port | 3000        |
| NODE_ENV | Environment | development |

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm start
```

## Deployment

### Docker

```bash
docker build -t adityajareda/quote-app .
docker push adityajareda/quote-app
```

### Kubernetes

```bash
kubectl apply -f k8s/
```

## TODO

* [ ] Add unit tests
* [ ] Add integration tests
* [ ] Implement Docker containerization
* [ ] Set up GitHub Actions CI/CD
* [ ] Deploy to Kubernetes
* [ ] Add Terraform configuration
* [ ] Implement monitoring with Netdata
* [ ] Add database persistence

## Contributing

This is a learning project for DevOps practices. Feel free to fork and experiment!

## License

MIT License - feel free to use this project for learning purposes.

## Author

**Your Name**

* GitHub: [@AdityaJareda](https://github.com/AdityaJareda)
* LinkedIn: [Aditya Singh](https://www.linkedin.com/in/adityajareda)

## Acknowledgments

* Built as part of DevOps learning journey
* Inspired by various DevOps best practices
* Quote data sourced from public domain

---

**A small step toward mastering DevOps.**
