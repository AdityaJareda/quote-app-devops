# Kubernetes Deployment Guide

## Prerequisites

- Minikube installed and running
- kubectl configured
- Docker image available on Docker Hub

## Quick Start

### 1. Start Minikube

```bash
minikube start --driver=docker
minikube addons enable metrics-server
minikube addons enable ingress
```

### 2. Deploy Application

```bash
# Apply all manifests
kubectl apply -f k8s/

# Or apply individually:
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml
```

### 3. Verify Deployment

```bash
# Check all resources
kubectl get all -n quote-app

# Check pod status
kubectl get pods -n quote-app

# Check service
kubectl get svc -n quote-app
```

### 4. Access Application

```bash
# Get service URL
minikube service quote-app-service -n quote-app --url

# Or use port forwarding
kubectl port-forward -n quote-app service/quote-app-service 8080:80

# Access at: http://localhost:8080
```

## Common Commands

### Viewing Resources

```bash
# List all resources in namespace
kubectl get all -n quote-app

# Get pods
kubectl get pods -n quote-app

# Get pods with more details
kubectl get pods -n quote-app -o wide

# Watch pods (live updates)
kubectl get pods -n quote-app -w

# Describe pod (detailed info)
kubectl describe pod <pod-name> -n quote-app

# Get services
kubectl get svc -n quote-app

# Get deployments
kubectl get deployment -n quote-app

# Get HPA
kubectl get hpa -n quote-app
```

### Logs

```bash
# View logs from pod
kubectl logs -n quote-app <pod-name>

# Follow logs (live)
kubectl logs -n quote-app <pod-name> -f

# View logs from all pods with label
kubectl logs -n quote-app -l app=quote-app --tail=50

# Stream logs from all pods
kubectl logs -n quote-app -l app=quote-app -f
```

### Debugging

```bash
# Execute command in pod
kubectl exec -n quote-app <pod-name> -- ls -la

# Get shell in pod
kubectl exec -it -n quote-app <pod-name> -- sh

# Check resource usage
kubectl top pods -n quote-app
kubectl top nodes

# View events
kubectl get events -n quote-app --sort-by='.lastTimestamp'

# Describe resource for troubleshooting
kubectl describe deployment quote-app-deployment -n quote-app
kubectl describe hpa quote-app-hpa -n quote-app
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment quote-app-deployment -n quote-app --replicas=5

# Check HPA status
kubectl get hpa -n quote-app

# Describe HPA
kubectl describe hpa quote-app-hpa -n quote-app
```

### Updates

```bash
# Update image
kubectl set image deployment/quote-app-deployment -n quote-app quote-app=adityajareda/quote-app:v2.0.0

# Rollout status
kubectl rollout status deployment/quote-app-deployment -n quote-app

# Rollout history
kubectl rollout history deployment/quote-app-deployment -n quote-app

# Rollback to previous version
kubectl rollout undo deployment/quote-app-deployment -n quote-app

# Rollback to specific revision
kubectl rollout undo deployment/quote-app-deployment -n quote-app --to-revision=2
```

### Configuration

```bash
# Edit deployment
kubectl edit deployment quote-app-deployment -n quote-app

# Edit configmap
kubectl edit configmap quote-app-config -n quote-app

# Apply changes from file
kubectl apply -f k8s/deployment.yaml
```

### Cleanup

```bash
# Delete all resources in namespace
kubectl delete namespace quote-app

# Or delete individually
kubectl delete -f k8s/

# Delete specific resource
kubectl delete pod <pod-name> -n quote-app
kubectl delete deployment quote-app-deployment -n quote-app
```

## Load Testing

### Install Load Testing Tools

```bash
# Apache Bench
sudo apt install apache2-utils

# hey (recommended)
wget https://hey-release.s3.us-east-2.amazonaws.com/hey_linux_amd64
chmod +x hey_linux_amd64
sudo mv hey_linux_amd64 /usr/local/bin/hey
```

### Generate Load

```bash
# Get service URL
SERVICE_URL=$(minikube service quote-app-service -n quote-app --url)

# Using Apache Bench
ab -n 50000 -c 100 $SERVICE_URL/api/quotes/random

# Using hey
hey -z 2m -c 50 -q 10 $SERVICE_URL/api/quotes/random

# Watch autoscaling
watch -n 2 kubectl get hpa -n quote-app
```

## Monitoring

### Kubernetes Dashboard

```bash
# Start dashboard
minikube dashboard

# Get dashboard URL
minikube dashboard --url
```

### Metrics

```bash
# Pod metrics
kubectl top pods -n quote-app

# Node metrics
kubectl top nodes

# HPA status
kubectl get hpa -n quote-app -w
```

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl get pods -n quote-app

# Describe pod for events
kubectl describe pod <pod-name> -n quote-app

# Check logs
kubectl logs <pod-name> -n quote-app
```

### Service Not Accessible

```bash
# Check service
kubectl get svc -n quote-app

# Check endpoints
kubectl get endpoints quote-app-service -n quote-app

# Test from inside cluster
kubectl run test-pod --rm -it --image=busybox -n quote-app -- sh
wget -qO- http://quote-app-service/health
```

### Image Pull Errors

```bash
# Check image name
kubectl describe pod <pod-name> -n quote-app | grep Image

# Verify image exists on Docker Hub
docker pull adityajareda/quote-app:latest

# Update deployment with correct image
kubectl set image deployment/quote-app-deployment -n quote-app quote-app=adityajareda/quote-app:latest
```

### HPA Not Working

```bash
# Check metrics-server
kubectl get pods -n kube-system | grep metrics-server

# Enable if not running
minikube addons enable metrics-server

# Check HPA
kubectl describe hpa quote-app-hpa -n quote-app

# Verify resource requests are set
kubectl describe deployment quote-app-deployment -n quote-app | grep -A 5 resources
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Kubernetes Cluster                 │
│  ┌───────────────────────────────────────────┐  │
│  │         Namespace: quote-app              │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  Deployment: quote-app-deployment   │  │  │
│  │  │  Replicas: 2-10 (autoscaled)        │  │  │
│  │  │                                     │  │  │
│  │  │  ┌─────┐  ┌─────┐  ┌─────┐          │  │  │
│  │  │  │Pod 1│  │Pod 2│  │Pod 3│  ...     │  │  │
│  │  │  └─────┘  └─────┘  └─────┘          │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                    ▲                      │  │
│  │                    │                      │  │
│  │  ┌─────────────────┴───────────────────┐  │  │
│  │  │  Service: quote-app-service         │  │  │
│  │  │  Type: NodePort                     │  │  │
│  │  │  Port: 80 → 3000                    │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                    ▲                      │  │
│  │                    │                      │  │
│  │  ┌─────────────────┴───────────────────┐  │  │
│  │  │  HPA: quote-app-hpa                 │  │  │
│  │  │  Min: 2, Max: 10                    │  │  │
│  │  │  CPU: 70%, Memory: 80%              │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  ConfigMap: quote-app-config        │  │  │
│  │  │  Environment Variables              │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Resource Specifications

### Pod Resources
- **CPU Request:** 100m (0.1 core)
- **CPU Limit:** 500m (0.5 core)
- **Memory Request:** 128Mi
- **Memory Limit:** 256Mi

### Autoscaling
- **Min Replicas:** 2
- **Max Replicas:** 10
- **CPU Target:** 70%
- **Memory Target:** 80%

### Probes
- **Liveness Probe:** /health endpoint, every 10s
- **Readiness Probe:** /health endpoint, every 5s

## Best Practices

1. **Always use namespaces** for logical isolation
2. **Set resource requests and limits** for predictable scaling
3. **Use ConfigMaps** for configuration (not hardcoded values)
4. **Implement health checks** (liveness and readiness probes)
5. **Use HPA** for automatic scaling
6. **Run as non-root user** for security
7. **Use rolling updates** for zero-downtime deployments
8. **Monitor resource usage** regularly
9. **Use labels** for organization and selection
10. **Version your manifests** in Git

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
