variable "docker_host" {
	description = "Docker daemon host"
	type = string
	default = "unix:///var/run/docker.sock"
}
