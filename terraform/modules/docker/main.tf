terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

variable "image_name" {
  description = "Docker image name"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "container_name" {
  description = "Container name"
  type        = string
}

variable "internal_port" {
  description = "Internal container port"
  type        = number
  default     = 3000
}

variable "external_port" {
  description = "External host port"
  type        = number
  default     = 3000
}

variable "environment_vars" {
  description = "Environment variables"
  type        = map(string)
  default     = {}
}

variable "restart_policy" {
  description = "Container restart policy"
  type        = string
  default     = "unless-stopped"
}


resource "docker_network" "app_network" {
  name = "${var.container_name}-network"
  driver = "bridge"
}

resource "docker_image" "app" {
  name         = "${var.image_name}:${var.image_tag}"
  keep_locally = false
}

resource "docker_container" "app" {
  name  = var.container_name
  image = docker_image.app.image_id

  ports {
    internal = var.internal_port
    external = var.external_port
  }

  env = [
    for key, value in var.environment_vars : "${key}=${value}"
  ]

  networks_advanced {
    name = docker_network.app_network.name
  }

  restart = var.restart_policy

  healthcheck {
    test     = ["CMD", "node", "-e", "require('http').get('http://localhost:${var.internal_port}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
    interval = "30s"
    timeout  = "3s"
    retries  = 3
  }
}

output "container_id" {
  description = "Container ID"
  value       = docker_container.app.id
}

output "container_name" {
  description = "Container name"
  value       = docker_container.app.name
}

output "network_name" {
  description = "Network name"
  value       = docker_network.app_network.name
}

output "access_url" {
  description = "Access URL"
  value       = "http://localhost:${var.external_port}"
}
