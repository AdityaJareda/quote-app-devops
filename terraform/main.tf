# ============================================
# ROOT TERRAFORM CONFIGURATION
# ============================================
# This is the main entry point for Terraform

terraform {
  required_version = ">= 1.0"
}

# ============================================
# INSTRUCTIONS
# ============================================
# 
# To use this Terraform configuration:
#
# 1. For Development (Docker):
#    cd environments/dev
#    terraform init
#    terraform plan
#    terraform apply
#
# 2. For Production (Kubernetes):
#    cd environments/prod
#    terraform init
#    terraform plan
#    terraform apply
#
# 3. To destroy:
#    terraform destroy
#
# ============================================
