# Harp Diem — AWS Infrastructure (Terraform)

This directory provisions everything needed to serve Harp Diem at **https://harpdiem.com**
on AWS, and to let GitHub Actions deploy to it automatically. It's written to be a
**learning resource** as much as working code — so it's heavily commented and this
README explains the *why*, not just the *how*.

> **You don't need to memorize any of this.** Read the [Glossary](#glossary) once,
> skim the [Architecture](#architecture), then follow the [Runbook](#runbook) top to bottom.

---

## Architecture

```
                          ┌──────────────────────────────┐
   Visitor's browser ───► │  Route 53 (DNS)              │
   https://harpdiem.com   │  harpdiem.com  → CloudFront  │
                          │  www.harpdiem.com → CloudFront│
                          └───────────────┬──────────────┘
                                          │ (alias record)
                                          ▼
                          ┌──────────────────────────────┐
                          │  CloudFront (global CDN)      │◄── ACM cert (us-east-1)
                          │  • HTTPS, HTTP→HTTPS redirect │     (TLS for harpdiem.com)
                          │  • security headers + CSP     │
                          │  • caches at edge locations   │
                          │  • 403/404 → /index.html (SPA)│
                          └───────────────┬──────────────┘
                                          │ Origin Access Control (signed)
                                          ▼
                          ┌──────────────────────────────┐
                          │  S3 bucket (PRIVATE)          │
                          │  holds the built dist/ files  │
                          └──────────────────────────────┘

   GitHub Actions (on push to main)
        │  assumes an IAM role via OIDC (no stored keys)
        ├─► aws s3 sync dist/  → the bucket
        └─► cloudfront create-invalidation → flush the edge cache
```

The app itself is a **static** React/Vite SPA — there is no server to run. AWS here is
purely a way to store files (S3) and serve them fast and securely worldwide (CloudFront).

---

## Glossary

| Term | What it means here |
|------|--------------------|
| **IaC** (Infrastructure as Code) | Describing your cloud resources in files instead of clicking in a console. Reproducible, reviewable, version-controlled. |
| **Terraform** | The IaC tool we use. You write `.tf` files; `terraform apply` makes AWS match them. |
| **Provider** | A Terraform plugin for a specific platform. We use the `aws` provider. We declare it twice: once for your region, once pinned to `us-east-1` (for the certificate). |
| **State** | Terraform's record of what it has created (`terraform.tfstate`). It maps your `.tf` resources to real AWS resource IDs. **Never commit it** — it can contain sensitive values. |
| **Resource** | One thing Terraform manages, e.g. `aws_s3_bucket.site`. |
| **Data source** | A read-only lookup of something that already exists, e.g. `data.aws_route53_zone`. |
| **S3** (Simple Storage Service) | Object storage. Our bucket holds the built website files. It is **private** — only CloudFront can read it. |
| **CloudFront** | AWS's CDN (Content Delivery Network). Caches your files at ~600 "edge locations" worldwide so they load fast, terminates HTTPS, and adds security headers. |
| **Edge location** | A CloudFront cache server near the user. The first request fetches from S3; later ones are served from the edge. |
| **OAC** (Origin Access Control) | The modern, signed mechanism that lets CloudFront read a **private** S3 bucket. Replaces the older "Origin Access Identity" (OAI). |
| **ACM** (AWS Certificate Manager) | Issues and auto-renews the free TLS certificate that gives you `https://`. For CloudFront the cert **must** live in `us-east-1`. |
| **Route 53** | AWS's DNS service. A **hosted zone** holds the DNS records for your domain. **Alias records** point your domain at CloudFront. |
| **Alias record** | A Route 53–specific record that points a domain at an AWS resource (like CloudFront) and follows its changing IPs — free, unlike a fixed A record. |
| **OIDC** (OpenID Connect) | A way for GitHub Actions to prove "I am repo X, branch main" to AWS and get **temporary** credentials — so you store **no** long-lived AWS keys in GitHub. |
| **IAM** (Identity & Access Management) | AWS permissions. We create a **role** GitHub assumes, with a least-privilege **policy** (sync the bucket + invalidate the CDN, nothing else). |
| **Invalidation** | Telling CloudFront to drop cached copies of files so visitors get the new deploy. We invalidate `index.html` (hashed assets are immutable, so they don't need it). |
| **Budget** | An AWS Budgets alarm that emails you if spend crosses a threshold — your safety net against a surprise bill. |

---

## What each file does

| File | Purpose |
|------|---------|
| `versions.tf` | Terraform/provider versions; the two `aws` providers (default + `us_east_1`). |
| `variables.tf` | All inputs (domain, region, repo, budget email, toggles). |
| `main.tf` | Computed `locals` (bucket name, www domain, resolved zone/OIDC ids). |
| `s3.tf` | The private origin bucket + public-access block + versioning + OAC bucket policy. |
| `acm.tf` | TLS certificate (us-east-1) + DNS validation records. |
| `route53.tf` | Hosted zone (create or reuse) + apex/www alias records to CloudFront. |
| `cloudfront.tf` | OAC, the security-headers/CSP policy, and the distribution itself. |
| `oidc.tf` | GitHub OIDC provider + the IAM deploy role and least-privilege policy. |
| `budget.tf` | Monthly cost budget with email alerts. |
| `outputs.tf` | Values you copy into GitHub (role ARN, bucket, distribution id) + name servers. |
| `terraform.tfvars.example` | Template for your own `terraform.tfvars`. |

---

## Prerequisites

1. **An AWS account** with admin (or sufficient) permissions for your user.
2. **Terraform** ≥ 1.6 — `brew install terraform` (macOS) or see <https://developer.hashicorp.com/terraform/install>.
3. **AWS CLI** — `brew install awscli`, then `aws configure` (set your access key, secret, and default region `us-east-1`). See <https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html>.
4. **Your domain registered in Route 53.** This is a paid, one-time step Terraform does *not* do for you (domain registration is awkward to automate and hard to undo):
   - Console → **Route 53 → Registered domains → Register domains** → search `harpdiem.com` → buy (~$13/yr for `.com`).
   - Registering in Route 53 **auto-creates a hosted zone**. If you do this, set `create_hosted_zone = false` in your tfvars so Terraform reuses it instead of making a duplicate.
   - (If you ever register elsewhere, set `create_hosted_zone = true`, let Terraform make the zone, then copy the `route53_name_servers` output into your registrar.)

---

## Runbook

All commands run from this `terraform/` directory.

```bash
# 1. Configure your inputs
cp terraform.tfvars.example terraform.tfvars
#   edit terraform.tfvars: set budget_alert_email, and set
#   create_hosted_zone = false if you registered the domain in Route 53.

# 2. Initialize (downloads the AWS provider, sets up state)
terraform init

# 3. See exactly what will be created — read this before applying
terraform plan

# 4. Create it. Type "yes" when prompted.
#    ACM certificate validation can take a few minutes; the apply will wait.
terraform apply
```

When `apply` finishes, Terraform prints the **outputs**. Wire the three GitHub ones
into the repo (Settings → Secrets and variables → Actions):

| Terraform output | GitHub | Name |
|------------------|--------|------|
| `github_deploy_role_arn` | **Secret** | `AWS_DEPLOY_ROLE_ARN` |
| `s3_bucket_name` | **Variable** | `S3_BUCKET` |
| `cloudfront_distribution_id` | **Variable** | `CLOUDFRONT_DISTRIBUTION_ID` |

You can do it from the CLI with `gh`:

```bash
gh secret   set AWS_DEPLOY_ROLE_ARN       -b "$(terraform output -raw github_deploy_role_arn)"
gh variable set S3_BUCKET                 -b "$(terraform output -raw s3_bucket_name)"
gh variable set CLOUDFRONT_DISTRIBUTION_ID -b "$(terraform output -raw cloudfront_distribution_id)"
```

Then push to `main` (or re-run the workflow) and GitHub Actions builds and deploys.
Before DNS finishes propagating you can test using the raw CloudFront domain:

```bash
terraform output -raw cloudfront_domain_name   # e.g. d1234abcd.cloudfront.net
```

See the repo-root **[DEPLOYMENT.md](../DEPLOYMENT.md)** for the full end-to-end launch checklist.

---

## Cost (what to expect)

A low-traffic static site like this typically costs **well under $1/month** plus the
domain (~$13/yr). The pieces:

- **S3** — pennies for a few MB stored + requests.
- **CloudFront** — free tier is generous (1 TB out/month, as of writing); `PriceClass_100` limits edges to NA+EU to keep it cheap.
- **Route 53** — **$0.50/month per hosted zone** + tiny query charges. This is the main fixed cost.
- **ACM** — free.
- The `budget.tf` alarm emails you long before anything runs away.

---

## Gotchas & tips

- **ACM must be us-east-1.** CloudFront only accepts certs from `us-east-1`. That's the entire reason for the `aws.us_east_1` provider. If you see "certificate not found" on the distribution, the cert is in the wrong region.
- **One OIDC provider per account.** `https://token.actions.githubusercontent.com` can exist only once. If you already created it (e.g. for another repo), set `create_github_oidc_provider = false`.
- **Don't make the bucket public.** The whole design keeps S3 private and reaches it only through CloudFront + OAC. Enabling S3 "static website hosting" or a public bucket policy would undo that.
- **CloudFront changes are slow.** Creating/updating a distribution can take several minutes to deploy to all edges. This is normal.
- **State lives locally.** This config uses local state (`terraform.tfstate` in this folder). Fine for one person learning. For a team, move it to a remote backend (S3 + DynamoDB lock) — see the link below.
- **`terraform destroy`** tears everything down. The S3 bucket must be empty first (versioning is on, so empty it in the console or with `aws s3 rm --recursive` + delete versions). The domain registration is *not* managed here, so it survives.
- **Cache headers come from upload, not here.** CloudFront's CachingOptimized policy honors the `Cache-Control` headers the deploy workflow sets on each object (`index.html` = no-cache, `/assets/*` = 1 year immutable).

---

## Learn more

**AWS**
- Static site on S3 + CloudFront (official tutorial): <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/getting-started-secure-static-website-cloudfront.html>
- Restricting S3 access with OAC: <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html>
- GitHub Actions OIDC with AWS: <https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services>
- Route 53 alias records: <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html>
- AWS Budgets: <https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html>

**Terraform**
- Get started with AWS: <https://developer.hashicorp.com/terraform/tutorials/aws-get-started>
- Language docs (resources, variables, outputs, locals): <https://developer.hashicorp.com/terraform/language>
- AWS provider reference: <https://registry.terraform.io/providers/hashicorp/aws/latest/docs>
- Remote state on S3 (when you outgrow local state): <https://developer.hashicorp.com/terraform/language/settings/backends/s3>
