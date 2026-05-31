# Provider + Terraform version constraints, and the AWS providers.
#
# We declare TWO aws providers:
#   - default: regional resources (the S3 bucket) in var.aws_region
#   - aws.us_east_1: pinned to us-east-1 because CloudFront REQUIRES its ACM
#     certificate to live in us-east-1, no matter where everything else runs.
# (When var.aws_region is already us-east-1 they point at the same place, but
#  keeping the alias makes the config correct even if you change the region.)

terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "harp-diem"
      ManagedBy = "terraform"
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "harp-diem"
      ManagedBy = "terraform"
    }
  }
}
