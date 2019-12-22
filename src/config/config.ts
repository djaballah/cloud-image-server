export const config = {
    "dev": {
        "aws_region": process.env.S3_AWS_REGION,
        "aws_media_bucket": process.env.S3_AWS_MEDIA_BUCKET,
        "aws_profile": process.env.AWS_PROFILE
    }
}