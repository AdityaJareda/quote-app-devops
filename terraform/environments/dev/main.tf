terraform {
  required_version = ">= 1.0"

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {
  host = "unix:///var/run/docker.sock"
}

module "quote_app_docker" {
  source = "../../modules/docker"

  image_name     = "adityajareda/quote-app"
  image_tag      = "latest"
  container_name = "quote-app-dev"
  internal_port  = 3000
  external_port  = 3000

  environment_vars = {
    NODE_ENV    = "development"
    PORT        = "3000"
    APP_NAME    = "Quote App"
    APP_VERSION = "1.0.0"
    LOG_LEVEL   = "debug"
  }

  restart_policy = "unless-stopped"
}

output "container_id" {
  description = "Docker container ID"
  value       = module.quote_app_docker.container_id
}

output "access_url" {
  description = "Application access URL"
  value       = module.quote_app_docker.access_url
}

output "container_name" {
  description = "Container name"
  value       = module.quote_app_docker.container_name
}
