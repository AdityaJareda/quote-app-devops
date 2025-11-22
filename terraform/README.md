# Terraform Infrastructure as Code

This directory contains Terraform configurations for deploying the Quote App to different environments.

## Structure

```
terraform/
├── modules/
│   ├── docker/          # Docker module (containers, images, networks)
│   └── kubernetes/      # Kubernetes module (pods, services, HPA)
├── environments/
│   ├── dev/            # Development environment (Docker)
│   └── prod/           # Production environment (Kubernetes)
└── main.tf             # Root configuration
```

## Prerequisites

- Terraform >= 1.0
- Docker (for dev environment)
- kubectl and Minikube (for prod environment)

## Usage

### Development Environment (Docker)

```bash
cd environments/dev

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply configuration
terraform apply

# Access application
curl http://localhost:3000/health

# Destroy resources
terraform destroy
```

### Production Environment (Kubernetes)

```bash
cd environments/prod

# Ensure Minikube is running
minikube status

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply configuration
terraform apply

# Check deployment
kubectl get all -n quote-app

# Access application
minikube service quote-app-service -n quote-app --url

# Destroy resources
terraform destroy
```

## Modules

### Docker Module

Manages Docker resources:
- Docker images
- Docker containers
- Docker networks
- Health checks

**Variables:**
- `image_name` - Docker image name
- `image_tag` - Image tag (default: latest)
- `container_name` - Container name
- `internal_port` - Container port (default: 3000)
- `external_port` - Host port (default: 3000)
- `environment_vars` - Environment variables (map)
- `restart_policy` - Restart policy (default: unless-stopped)

**Outputs:**
- `container_id` - Container ID
- `container_name` - Container name
- `network_name` - Network name
- `access_url` - Application URL

### Kubernetes Module

Manages Kubernetes resources:
- Namespace
- ConfigMap
- Deployment
- Service (NodePort)
- Horizontal Pod Autoscaler

**Variables:**
- `namespace` - Kubernetes namespace
- `app_name` - Application name
- `image` - Docker image
- `replicas` - Number of replicas (default: 3)
- `container_port` - Container port (default: 3000)
- `service_port` - Service port (default: 80)
- `node_port` - NodePort (default: 30080)
- `environment_vars` - Environment variables (map)
- `cpu_request` - CPU request (default: 100m)
- `cpu_limit` - CPU limit (default: 500m)
- `memory_request` - Memory request (default: 128Mi)
- `memory_limit` - Memory limit (default: 256Mi)
- `hpa_enabled` - Enable HPA (default: true)
- `hpa_min_replicas` - Min replicas (default: 2)
- `hpa_max_replicas` - Max replicas (default: 10)
- `hpa_cpu_threshold` - CPU threshold % (default: 70)

**Outputs:**
- `namespace` - Namespace name
- `deployment_name` - Deployment name
- `service_name` - Service name
- `service_port` - Service port
- `node_port` - NodePort

## Common Commands

```bash
# Initialize
terraform init

# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# Plan changes
terraform plan

# Apply changes
terraform apply

# Show current state
terraform show

# List resources
terraform state list

# Show outputs
terraform output

# Destroy resources
terraform destroy
```

## State Management

Terraform stores state in `terraform.tfstate` file. This file contains:
- Current infrastructure state
- Resource dependencies
- Metadata

**Important:**
- Never edit state files manually
- Keep state files secure (contain sensitive data)
- For production, use remote state (S3, Terraform Cloud)

## Best Practices

1. **Use modules** for reusable configurations
2. **Separate environments** (dev, staging, prod)
3. **Use variables** for configurable values
4. **Output important values** for easy access
5. **Version control** all Terraform files
6. **Use remote state** for production
7. **Plan before apply** to review changes
8. **Use workspaces** for environment isolation

## Troubleshooting

### Issue: Provider authentication failed

```bash
# For Docker
docker ps  # Verify Docker is running

# For Kubernetes
kubectl cluster-info  # Verify cluster access
```

### Issue: Resource already exists

```bash
# Import existing resource
terraform import module.quote_app_k8s.kubernetes_namespace.app quote-app

# Or destroy and recreate
terraform destroy
terraform apply
```

### Issue: State lock

```bash
# Force unlock (use with caution)
terraform force-unlock <lock-id>
```

## Additional Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [Docker Provider](https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs)
- [Kubernetes Provider](https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs)
