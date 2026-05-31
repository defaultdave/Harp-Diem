# Computed values reused across the configuration. Terraform merges `locals`
# blocks across files, but each name must be defined exactly once — so all of
# ours live here even though they reference resources declared elsewhere.

locals {
  www_domain  = "www.${var.domain_name}"
  bucket_name = "${replace(var.domain_name, ".", "-")}-site" # harpdiem.com -> harpdiem-com-site

  # Resolve the hosted zone whether we created it or are reusing an existing one.
  zone_id = var.create_hosted_zone ? aws_route53_zone.this[0].zone_id : data.aws_route53_zone.this[0].zone_id

  # Resolve the GitHub OIDC provider ARN the same way.
  github_oidc_arn = var.create_github_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : data.aws_iam_openid_connect_provider.github[0].arn
}
