# All inputs to the configuration. Override them in terraform.tfvars
# (copy terraform.tfvars.example). Only `budget_alert_email` is required.

variable "domain_name" {
  description = "Apex domain for the site (e.g. harpdiem.com)."
  type        = string
  default     = "harpdiem.com"

  validation {
    # Also used to derive the S3 bucket name, so keep it to valid lowercase domain chars.
    condition     = can(regex("^[a-z0-9][a-z0-9.-]*[a-z0-9]$", var.domain_name))
    error_message = "domain_name must be a lowercase domain (letters, digits, dots, hyphens)."
  }
}

variable "aws_region" {
  description = "Region for regional resources (the S3 bucket). CloudFront is global and its ACM cert is always created in us-east-1."
  type        = string
  default     = "us-east-1"
}

variable "github_repository" {
  description = "GitHub repository allowed to assume the deploy role, in 'owner/name' form."
  type        = string
  default     = "defaultdave/Harp-Diem"
}

variable "github_deploy_branch" {
  description = "Branch allowed to deploy via OIDC (the role can only be assumed from this branch)."
  type        = string
  default     = "main"
}

variable "budget_alert_email" {
  description = "Email address that receives AWS Budget cost alerts."
  type        = string
}

variable "monthly_budget_usd" {
  description = "Monthly cost budget in USD. You get alerts as actual/forecast spend crosses thresholds."
  type        = number
  default     = 10
}

variable "price_class" {
  description = "CloudFront price class. PriceClass_100 is cheapest (North America + Europe edge locations only)."
  type        = string
  default     = "PriceClass_100"
}

variable "create_hosted_zone" {
  description = "Whether Terraform creates the Route 53 hosted zone. Set to false if you already have one (registering a domain in Route 53 creates a zone automatically)."
  type        = bool
  default     = true
}

variable "create_github_oidc_provider" {
  description = "Whether Terraform creates the GitHub OIDC identity provider. There can be only ONE per AWS account — set to false if it already exists."
  type        = bool
  default     = true
}
