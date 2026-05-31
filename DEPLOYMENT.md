# Deployment

Harp Diem is a static React/Vite SPA hosted on **AWS S3 + CloudFront**, provisioned
with **Terraform** and deployed automatically by **GitHub Actions** on every push to
`main`. This is the end-to-end launch checklist. For the *why* behind the
infrastructure and a glossary of AWS terms, read **[terraform/README.md](terraform/README.md)**.

```
register domain ─► terraform apply ─► set GitHub secrets ─► push to main ─► live
   (one-time)        (one-time)          (one-time)          (every deploy)
```

---

## One-time setup

### 1. Register the domain
Route 53 → Registered domains → **Register** `harpdiem.com` (~$13/yr). This auto-creates
a hosted zone — so set `create_hosted_zone = false` in your Terraform vars.

### 2. Provision the infrastructure
See **[terraform/README.md → Runbook](terraform/README.md#runbook)**. In short:
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # set budget_alert_email, create_hosted_zone=false
terraform init
terraform plan
terraform apply
```

### 3. Wire GitHub Actions to AWS
From `terraform/`, using the outputs:
```bash
gh secret   set AWS_DEPLOY_ROLE_ARN        -b "$(terraform output -raw github_deploy_role_arn)"
gh variable set S3_BUCKET                  -b "$(terraform output -raw s3_bucket_name)"
gh variable set CLOUDFRONT_DISTRIBUTION_ID -b "$(terraform output -raw cloudfront_distribution_id)"
```

### 4. (Optional) Error tracking with Sentry
Create a free project at <https://sentry.io> (platform: React), copy its DSN, then:
```bash
gh secret set VITE_SENTRY_DSN -b "https://...your-dsn..."
```
Leave it unset and Sentry is completely removed from the bundle.

---

## Deploying

Push to `main` (or re-run the **CI** workflow). The pipeline:
1. **verify** — `npm ci`, eslint, type-check + build, unit tests, Playwright E2E.
2. **deploy** (main only) — assumes the AWS role via OIDC, `aws s3 sync` the build with
   correct cache headers, and invalidates CloudFront.

No AWS keys are ever stored in GitHub — authentication is short-lived OIDC tokens.

---

## Verifying a deploy

```bash
# Before DNS propagates, hit CloudFront directly:
curl -I "https://$(cd terraform && terraform output -raw cloudfront_domain_name)"

# After DNS propagates:
curl -I https://harpdiem.com           # expect 200, HSTS + CSP headers present
```

Post-launch smoke checklist:
- [ ] Site loads at `https://harpdiem.com` and `https://www.harpdiem.com` (both via HTTPS).
- [ ] Security headers present (`curl -I` shows `strict-transport-security`, `content-security-policy`, `x-content-type-options`).
- [ ] Harmonica grid, theme toggle, chord explorer, export (PNG/PDF), and the **mic tuner** all work — test the mic in **Chrome, Firefox, and Safari** (Safari is strict about AudioContext/getUserMedia).
- [ ] `#/quiz` deep link and a config deep link (e.g. `/#/?harpKey=G&scale=blues`) load correctly.
- [ ] Share the URL in Slack/iMessage/Twitter → the **social-preview card** renders.
- [ ] `https://harpdiem.com/privacy.html` loads.
- [ ] Run Lighthouse (Performance / Accessibility / SEO / Best Practices) and note scores.

---

## Rollback

S3 versioning is enabled. To roll back, redeploy a previous commit (push it / re-run the
workflow), or restore prior object versions in the console, then invalidate CloudFront.

## Legacy GitHub Pages

The repo still supports the old GitHub Pages target via `npm run deploy:gh-pages`
(it builds with `VITE_BASE_PATH=/Harp-Diem/`). AWS is the primary, maintained target.

## Teardown

`cd terraform && terraform destroy` removes all AWS resources (empty the S3 bucket first —
versioning is on). Domain registration is not managed by Terraform and survives.
