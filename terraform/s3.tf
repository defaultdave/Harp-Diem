# The origin bucket. It is PRIVATE — all public access is blocked. Only the
# CloudFront distribution can read it, via Origin Access Control (see cloudfront.tf).
# Never enable S3 static website hosting here; that would make the bucket public.

resource "aws_s3_bucket" "site" {
  bucket = local.bucket_name
}

# Belt-and-suspenders: block every form of public access at the bucket level.
resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Keep old object versions so a bad deploy can be rolled back.
resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Bucket policy: allow s3:GetObject ONLY to CloudFront, and ONLY for this
# specific distribution (the AWS:SourceArn condition). This is what makes OAC
# work while the bucket stays private.
data "aws_iam_policy_document" "site" {
  statement {
    sid       = "AllowCloudFrontOACRead"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.this.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.site.json
}
