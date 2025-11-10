# Docker Documentation

Complete guide to using Docker with Quote App.

## Table of Contents

- [Building Images](#building-images)
- [Running Containers](#running-containers)
- [Docker Compose](#docker-compose)
- [Docker Hub](#docker-hub)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Building Images

### Basic Build

```bash
docker build -t quote-app .
```

### Multi-stage Build Explanation

Our Dockerfile uses multi-stage builds:

1. **Stage 1 (builder):** Installs dependencies and runs tests
2. **Stage 2 (production):** Creates minimal production image

Benefits:
- Smaller final image (~150MB vs ~500MB)
- Faster builds (layer caching)
- More secure (fewer tools in production)

### Build Arguments

```bash
# Build specific version
docker build -t quote-app:v1.0.0 .

# Build with build args
docker build --build-arg NODE_VERSION=18 -t quote-app .
```

## Running Containers

### Basic Run

```bash
docker run -p 3000:3000 quote-app
```

### With Environment Variables

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  quote-app
```

### Detached Mode

```bash
docker run -d --name my-quote-app -p 3000:3000 quote-app
```

### With Volume Mounts (Development)

```bash
docker run -p 3000:3000 \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/public:/app/public \
  quote-app
```

## Docker Compose

### Production

```bash
# Start
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Development

```bash
# Start with live reload
docker compose -f docker-compose.dev.yml up

# Rebuild
docker compose -f docker-compose.dev.yml up --build
```

## Docker Hub

### Pulling Images

```bash
# Latest version
docker pull yourusername/quote-app:latest

# Specific version
docker pull yourusername/quote-app:v1.0.0
```

### Pushing Images

```bash
# Login
docker login

# Tag
docker tag quote-app:latest yourusername/quote-app:latest

# Push
docker push yourusername/quote-app:latest
```

## Best Practices

### 1. Use .dockerignore

Exclude unnecessary files:
```
node_modules/
.git/
tests/
```

### 2. Multi-stage Builds

Separate build and production stages for smaller images.

### 3. Non-root User

Run as non-root for security:
```dockerfile
USER nodejs
```

### 4. Health Checks

Include health checks:
```dockerfile
HEALTHCHECK --interval=30s CMD node -e "..."
```

### 5. Layer Caching

Order Dockerfile instructions strategically:
- Less frequently changing commands first
- More frequently changing commands last

### 6. Semantic Versioning

Tag images with versions:
```bash
docker tag app:latest app:v1.0.0
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs quote-app-container

# Check if port is in use
sudo lsof -i :3000
```

### Image Build Fails

```bash
# Clear build cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t quote-app .
```

### Can't Connect to Container

```bash
# Check if container is running
docker ps

# Check container IP
docker inspect quote-app-container | grep IPAddress

# Execute shell in container
docker exec -it quote-app-container sh
```

### High Memory Usage

```bash
# Check container stats
docker stats quote-app-container

# Set memory limits in docker-compose.yml
```

## Common Commands Reference

```bash
# Build
docker build -t quote-app .

# Run
docker run -p 3000:3000 quote-app

# Stop
docker stop quote-app-container

# Remove
docker rm quote-app-container

# Logs
docker logs -f quote-app-container

# Execute command
docker exec -it quote-app-container sh

# List images
docker images

# Remove image
docker rmi quote-app

# Clean up
docker system prune -a
```
