# Values you need after `terraform apply`. The three marked "GitHub" go into the
# repo's Actions secrets/variables so the deploy workflow can do its job.

output "github_deploy_role_arn" {
  description = "GitHub secret: AWS_DEPLOY_ROLE_ARN — role the deploy workflow assumes via OIDC."
  value       = aws_iam_role.github_deploy.arn
}

output "s3_bucket_name" {
  description = "GitHub variable: S3_BUCKET — bucket the workflow syncs the build into."
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "GitHub variable: CLOUDFRONT_DISTRIBUTION_ID — distribution the workflow invalidates."
  value       = aws_cloudfront_distribution.this.id
}

output "cloudfront_domain_name" {
  description = "CloudFront's own domain — use it to smoke-test the site before DNS finishes propagating."
  value       = aws_cloudfront_distribution.this.domain_name
}

output "route53_name_servers" {
  description = "If Terraform created the hosted zone, set these as your domain's name servers at the registrar (Route 53 does this automatically if you also registered the domain there)."
  value       = var.create_hosted_zone ? aws_route53_zone.this[0].name_servers : null
}
