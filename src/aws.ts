import AWS = require('aws-sdk');
import { config } from './config/config';

const c = config.dev;


if(c.aws_profile !== "DEPLOYED") {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({
        profile: c.aws_profile
    });
}

export const s3 = new AWS.S3({
    signatureVersion: "v4",
    region: c.aws_region,
    params: {
        Bucket: c.aws_media_bucket
    }
});

export function getGetSignedUrl(key: string): string {

    var params = {
        Key: key,
        Expires: 60 * 5
    }
    return s3.getSignedUrl("getObject", params);
}

export function getPutSignedUrl(key: string): string {

    var params = {
        Key: key,
        Expires: 60 * 5
    }

    return s3.getSignedUrl("putObject", params);
}