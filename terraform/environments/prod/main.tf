terraform {
  required_version = ">= 1.0"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.24"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

module "quote_app_k8s" {
  source = "../../modules/kubernetes"

  namespace      = "quote-app"
  app_name       = "quote-app"
  image          = "adityajareda/quote-app:latest"
  replicas       = 3
  container_port = 3000
  service_port   = 80
  node_port      = 30080

  environment_vars = {
    NODE_ENV    = "production"
    PORT        = "3000"
    APP_NAME    = "Quote App"
    APP_VERSION = "1.0.0"
    LOG_LEVEL   = "info"
  }

  cpu_request    = "100m"
  cpu_limit      = "500m"
  memory_request = "128Mi"
  memory_limit   = "256Mi"

  hpa_enabled       = true
  hpa_min_replicas  = 2
  hpa_max_replicas  = 10
  hpa_cpu_threshold = 70
}

output "namespace" {
  description = "Kubernetes namespace"
  value       = module.quote_app_k8s.namespace
}

output "deployment_name" {
  description = "Deployment name"
  value       = module.quote_app_k8s.deployment_name
}

output "service_name" {
  description = "Service name"
  value       = module.quote_app_k8s.service_name
}

output "access_port" {
  description = "NodePort for external access"
  value       = module.quote_app_k8s.node_port
}
