# The CDN. CloudFront sits in front of the private S3 bucket, terminates HTTPS
# with the ACM cert, attaches security headers, caches at edge locations, and
# serves the SPA. Origin Access Control (OAC) is the modern, signed way for
# CloudFront to read a private bucket (replaces the legacy Origin Access Identity).

resource "aws_cloudfront_origin_access_control" "this" {
  name                              = "${local.bucket_name}-oac"
  description                       = "OAC for the Harp Diem origin bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Security headers applied to every response. CSP is tuned for this app:
#   - script-src 'self'         : only our bundled JS (no inline/3rd-party scripts)
#   - style-src 'unsafe-inline' : React sets inline style attributes
#   - img-src data:             : canvas/export produces data: URLs
#   - connect-src ... sentry    : allow Sentry error ingestion (harmless if unused)
resource "aws_cloudfront_response_headers_policy" "security" {
  name = "harpdiem-security-headers"

  security_headers_config {
    content_type_options {
      override = true
    }
    frame_options {
      frame_option = "DENY"
      override     = true
    }
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
    strict_transport_security {
      access_control_max_age_sec = 63072000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
    content_security_policy {
      override                = true
      content_security_policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://*.ingest.sentry.io https://*.ingest.us.sentry.io; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests"
    }
  }
}

resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Harp Diem static site"
  default_root_object = "index.html"
  price_class         = var.price_class
  aliases             = [var.domain_name, local.www_domain]

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-${aws_s3_bucket.site.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.this.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-${aws_s3_bucket.site.id}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # AWS-managed "CachingOptimized" policy. It honors the Cache-Control headers
    # we set at upload time (index.html = no-cache, /assets/* = 1 year immutable).
    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
  }

  # SPA fallback. The app is hash-routed so "/" already serves everything, but a
  # private bucket returns 403 for any missing key — map 403/404 to index.html so
  # unknown paths still render the app instead of an XML error.
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 300
  }
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 300
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.this.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
