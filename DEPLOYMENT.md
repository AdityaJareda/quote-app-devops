# Deployment Guide

This guide covers all deployment methods for the Quote App, from local development to production Kubernetes.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Docker Compose Deployment](#docker-compose-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Terraform Deployment](#terraform-deployment)
- [Monitoring Setup](#monitoring-setup)
- [Post-Deployment Verification](#post-deployment-verification)
- [Scaling](#scaling)
- [Updates and Rollbacks](#updates-and-rollbacks)

---

## Prerequisites

### Required Software

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: For version control
- **Docker**: 24.x or higher (for containerized deployments)
- **kubectl**: For Kubernetes deployments
- **Minikube**: For local Kubernetes cluster
- **Terraform**: 1.0+ (optional, for IaC)
- **Helm**: 3.x (optional, for monitoring)

### Check Versions
```bash
node --version    # Should be v18.x.x
npm --version     # Should be 9.x.x or higher
docker --version  # Should be 24.x.x or higher
kubectl version --client
minikube version
terraform version
helm version
```

---

## Local Development

### 1. Clone Repository
```bash
git clone https://github.com/AdityaJareda/quote-app-devops.git
cd quote-app-devops
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit if needed
nano .env
```

**Default .env:**
```env
PORT=3000
NODE_ENV=development
APP_NAME=Quote App
APP_VERSION=1.0.0
```

### 4. Run Application
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### 5. Access Application

- **Frontend**: http://localhost:3000
- **API Health**: http://localhost:3000/health
- **Metrics**: http://localhost:3000/metrics

### 6. Run Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

---

## Docker Deployment

### Method 1: Pull from Docker Hub
```bash
# Pull latest image
docker pull adityajareda/quote-app:latest

# Run container
docker run -d \
  --name quote-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  adityajareda/quote-app:latest

# Check logs
docker logs -f quote-app

# Access application
curl http://localhost:3000/health
```

### Method 2: Build Locally
```bash
# Build image
docker build -t quote-app:local .

# Run container
docker run -d \
  --name quote-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  quote-app:local
```

### Verify Deployment
```bash
# Check container status
docker ps | grep quote-app

# View logs
docker logs quote-app

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/quotes/random

# Check resource usage
docker stats quote-app
```

### Stop and Remove
```bash
docker stop quote-app
docker rm quote-app
```

---

## Docker Compose Deployment

### Production Deployment
```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps

# Stop services
docker compose down
```

### Development Deployment
```bash
# Start with development configuration
docker compose -f docker-compose.dev.yml up

# This includes:
# - Volume mounts for live reload
# - Debug logging
# - Nodemon for auto-restart
```

### Configuration

**docker-compose.yml** includes:
- Application container
- Custom network
- Health checks
- Resource limits
- Restart policies

### Verify Deployment
```bash
# Test application
curl http://localhost:3000/health

# View service logs
docker compose logs app

# Check resource usage
docker compose stats
```

---

## Kubernetes Deployment

### Prerequisites
```bash
# Start Minikube
minikube start --driver=docker

# Enable addons
minikube addons enable metrics-server
minikube addons enable ingress

# Verify cluster
kubectl cluster-info
kubectl get nodes
```

### Deploy Application
```bash
# Apply all manifests
kubectl apply -f k8s/

# Or apply individually
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
```

### Verify Deployment
```bash
# Check namespace
kubectl get namespace quote-app

# Check all resources
kubectl get all -n quote-app

# Check pod status
kubectl get pods -n quote-app -w

# Expected output:
# NAME                                    READY   STATUS    RESTARTS   AGE
# quote-app-deployment-xxxxx-yyyyy        1/1     Running   0          2m
# quote-app-deployment-xxxxx-zzzzz        1/1     Running   0          2m
# quote-app-deployment-xxxxx-aaaaa        1/1     Running   0          2m
```

### Access Application

**Method 1: Minikube Service**
```bash
# Get service URL
minikube service quote-app-service -n quote-app --url

# Access in browser or curl
curl $(minikube service quote-app-service -n quote-app --url)/health
```

**Method 2: Port Forwarding**
```bash
# Forward local port to service
kubectl port-forward -n quote-app service/quote-app-service 8080:80

# Access at http://localhost:8080
curl http://localhost:8080/health
```

**Method 3: NodePort (from host)**
```bash
# Get Minikube IP
minikube ip

# Access via NodePort (30080)
curl http://$(minikube ip):30080/health
```

### Check Logs
```bash
# View logs from all pods
kubectl logs -n quote-app -l app=quote-app

# Follow logs
kubectl logs -n quote-app -l app=quote-app -f

# Logs from specific pod
kubectl logs -n quote-app <pod-name>
```

### Verify Auto-Scaling
```bash
# Check HPA status
kubectl get hpa -n quote-app

# Watch HPA in real-time
kubectl get hpa -n quote-app -w

# Describe HPA
kubectl describe hpa quote-app-hpa -n quote-app
```

### Test Auto-Scaling
```bash
# Install load testing tool
wget https://hey-release.s3.us-east-2.amazonaws.com/hey_linux_amd64
chmod +x hey_linux_amd64
sudo mv hey_linux_amd64 /usr/local/bin/hey

# Get service URL
SERVICE_URL=$(minikube service quote-app-service -n quote-app --url)

# Generate load
hey -z 2m -c 50 -q 10 $SERVICE_URL/api/quotes/random

# Watch pods scale up
kubectl get pods -n quote-app -w
```

---

## Terraform Deployment

### Development Environment (Docker)
```bash
# Navigate to dev environment
cd terraform/environments/dev

# Initialize Terraform
terraform init

# Review planned changes
terraform plan

# Apply configuration
terraform apply

# Type 'yes' when prompted

# View outputs
terraform output
```

**Verify Docker Deployment:**
```bash
docker ps | grep quote-app-dev
curl http://localhost:3000/health
```

### Production Environment (Kubernetes)
```bash
# Ensure Minikube is running
minikube status

# Navigate to prod environment
cd terraform/environments/prod

# Initialize Terraform
terraform init

# Review planned changes
terraform plan

# Apply configuration
terraform apply

# View outputs
terraform output
```

**Verify Kubernetes Deployment:**
```bash
kubectl get all -n quote-app-terraform
minikube service quote-app-service -n quote-app-terraform --url
```

### Destroy Resources
```bash
# Development
cd terraform/environments/dev
terraform destroy

# Production
cd terraform/environments/prod
terraform destroy
```

---

## Monitoring Setup

### Install Prometheus
```bash
# Add Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Create namespace
kubectl create namespace monitoring

# Install Prometheus
helm install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  --values monitoring/prometheus-values.yaml
```

### Install Grafana
```bash
# Add Helm repo
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Grafana
helm install grafana grafana/grafana \
  --namespace monitoring \
  --values monitoring/grafana-values-simple.yaml
```

### Access Monitoring

**Prometheus:**
```bash
kubectl port-forward -n monitoring svc/prometheus-server 9090:80
# Access: http://localhost:9090
```

**Grafana:**
```bash
kubectl port-forward -n monitoring svc/grafana 3001:80
# Access: http://localhost:3001
# Login: admin / admin123
```

### Import Dashboard

1. Open Grafana in browser
2. Click "+" → "Import"
3. Copy content from `monitoring/quote-app-dashboard.json`
4. Paste into "Import via dashboard JSON model" text box
5. Click "Load"
6. Select Prometheus datasource
7. Click "Import"

---

## Post-Deployment Verification

### Health Checks
```bash
# Application health
curl http://localhost:3000/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "uptime": 123.45,
#   "environment": "production",
#   "quotesLoaded": 10
# }
```

### API Endpoints
```bash
# Test all endpoints
curl http://localhost:3000/api/quotes
curl http://localhost:3000/api/quotes/random
curl http://localhost:3000/api/quotes/1
curl http://localhost:3000/api/quotes/category/motivation
curl http://localhost:3000/api/categories
```

### Metrics
```bash
# Check Prometheus metrics
curl http://localhost:3000/metrics

# Should see metrics like:
# http_requests_total
# quotes_served_total
# process_cpu_seconds_total
```

### Kubernetes Specific
```bash
# Check pod health
kubectl get pods -n quote-app

# All pods should show: READY 1/1, STATUS Running

# Check service endpoints
kubectl get endpoints -n quote-app

# Check HPA
kubectl get hpa -n quote-app
```

---

## Scaling

### Manual Scaling

**Docker:**
```bash
# Docker doesn't support direct scaling
# Use Docker Compose for multiple replicas
docker compose up -d --scale app=3
```

**Kubernetes:**
```bash
# Scale deployment
kubectl scale deployment quote-app-deployment -n quote-app --replicas=5

# Verify
kubectl get pods -n quote-app
```

### Auto-Scaling (Kubernetes)

**Already configured via HPA:**
- Min replicas: 2
- Max replicas: 10
- CPU threshold: 70%
- Memory threshold: 80%

**Monitor auto-scaling:**
```bash
# Watch HPA
kubectl get hpa -n quote-app -w

# View scaling events
kubectl describe hpa quote-app-hpa -n quote-app
```

---

## Updates and Rollbacks

### Docker Update
```bash
# Pull new image
docker pull adityajareda/quote-app:latest

# Stop old container
docker stop quote-app
docker rm quote-app

# Start new container
docker run -d --name quote-app -p 3000:3000 adityajareda/quote-app:latest
```

### Kubernetes Update
```bash
# Update image
kubectl set image deployment/quote-app-deployment \
  -n quote-app \
  quote-app=adityajareda/quote-app:v1.1.0

# Watch rollout
kubectl rollout status deployment/quote-app-deployment -n quote-app

# Check rollout history
kubectl rollout history deployment/quote-app-deployment -n quote-app
```

### Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/quote-app-deployment -n quote-app

# Rollback to specific revision
kubectl rollout undo deployment/quote-app-deployment -n quote-app --to-revision=2

# Verify rollback
kubectl rollout status deployment/quote-app-deployment -n quote-app
```

### Zero-Downtime Updates

Kubernetes deployment is configured with:
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

This ensures:
- At least 3 pods always running
- New pods start before old pods terminate
- Zero downtime during updates

---

## Cleanup

### Local Development
```bash
# Stop application (Ctrl+C)

# Clean node_modules
rm -rf node_modules
```

### Docker
```bash
# Stop and remove container
docker stop quote-app
docker rm quote-app

# Remove image
docker rmi adityajareda/quote-app:latest

# Clean up all
docker system prune -a
```

### Docker Compose
```bash
# Stop and remove
docker compose down

# Remove volumes
docker compose down -v
```

### Kubernetes
```bash
# Delete namespace (removes everything)
kubectl delete namespace quote-app

# Or delete individually
kubectl delete -f k8s/
```

### Terraform
```bash
# Destroy infrastructure
cd terraform/environments/<env>
terraform destroy
```

### Monitoring
```bash
# Uninstall Helm charts
helm uninstall prometheus -n monitoring
helm uninstall grafana -n monitoring

# Delete namespace
kubectl delete namespace monitoring
```

---

## Environment-Specific Notes

### Development
- Use `npm run dev` for hot reload
- Mount volumes in Docker Compose
- Single replica is sufficient
- Debug logging enabled

### Staging
- Use production builds
- 2-3 replicas recommended
- Enable monitoring
- Test auto-scaling

### Production
- Always use versioned images (not :latest)
- Minimum 3 replicas for HA
- Enable all monitoring and alerting
- Configure backups
- Use secrets for sensitive data
- Enable resource limits
- Configure proper logging

---

## Quick Reference

### Start Everything
```bash
# Kubernetes
kubectl apply -f k8s/
minikube service quote-app-service -n quote-app --url

# Docker
docker run -d -p 3000:3000 adityajareda/quote-app:latest

# Local
npm start
```

### Stop Everything
```bash
# Kubernetes
kubectl delete namespace quote-app

# Docker
docker stop quote-app && docker rm quote-app

# Local
# Ctrl+C
```

### View Logs
```bash
# Kubernetes
kubectl logs -n quote-app -l app=quote-app -f

# Docker
docker logs -f quote-app

# Local
# Shown in terminal
```

---

## Next Steps

1. Set up monitoring dashboards
2. Configure alerting rules
3. Implement backup strategy
4. Set up SSL/TLS certificates
5. Configure custom domain
6. Enable centralized logging
7. Set up CD for automated deployments

---

For troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
