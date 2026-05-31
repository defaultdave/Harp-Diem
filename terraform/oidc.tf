# GitHub Actions -> AWS authentication via OpenID Connect (OIDC).
#
# Instead of storing long-lived AWS access keys in GitHub secrets, GitHub mints a
# short-lived OIDC token for each workflow run. AWS trusts that token (scoped to
# THIS repo + branch) and hands back temporary credentials. No static secrets.

# One OIDC provider per AWS account. Toggle off if it already exists.
resource "aws_iam_openid_connect_provider" "github" {
  count           = var.create_github_oidc_provider ? 1 : 0
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  # GitHub's well-known root CA thumbprint. AWS now validates GitHub's token
  # signature against its own trust store, but the field is still required.
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

data "aws_iam_openid_connect_provider" "github" {
  count = var.create_github_oidc_provider ? 0 : 1
  url   = "https://token.actions.githubusercontent.com"
}

# Trust policy: only GitHub, only this repo, only the deploy branch may assume the role.
data "aws_iam_policy_document" "github_assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    principals {
      type        = "Federated"
      identifiers = [local.github_oidc_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repository}:ref:refs/heads/${var.github_deploy_branch}"]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name               = "github-actions-harpdiem-deploy"
  description        = "Assumed by GitHub Actions to deploy Harp Diem to S3 + CloudFront"
  assume_role_policy = data.aws_iam_policy_document.github_assume.json
}

# Least-privilege deploy permissions: sync the bucket + invalidate the CDN. Nothing else.
data "aws_iam_policy_document" "deploy_permissions" {
  statement {
    sid       = "ListSiteBucket"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.site.arn]
  }
  statement {
    sid       = "WriteSiteObjects"
    actions   = ["s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]
  }
  statement {
    sid       = "InvalidateCdn"
    actions   = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"]
    resources = [aws_cloudfront_distribution.this.arn]
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "harpdiem-deploy"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.deploy_permissions.json
}
