# Cost guardrail. A static site behind CloudFront usually costs cents/month, but
# this is the classic place a "learning AWS" account gets a surprise bill. This
# budget emails you when actual spend passes 80% or forecast passes 100% of the cap.

resource "aws_budgets_budget" "monthly" {
  name         = "harpdiem-monthly"
  budget_type  = "COST"
  limit_amount = tostring(var.monthly_budget_usd)
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.budget_alert_email]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.budget_alert_email]
  }
}
