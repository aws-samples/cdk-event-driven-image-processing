# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import os
import json
import uuid
import urllib
import boto3
from botocore.exceptions import ClientError
from PIL import Image

s3_client = boto3.client("s3")
dynamodb_client = boto3.resource("dynamodb")

TARGET_BUCKET = os.environ["TARGET_BUCKET"]
TABLE_NAME = os.environ["TABLE_NAME"]
CDN_DOMAIN = os.environ["CDN_DOMAIN"]


def handler(event, context):
    bucket = event["Records"][0]["s3"]["bucket"]["name"]
    print(f"Bucket={bucket}")

    image_key = urllib.parse.unquote_plus(
        event["Records"][0]["s3"]["object"]["key"], encoding="utf-8"
    )
    print(f"Image Key={image_key}")

    # each uploaded image has a unique id
    unique_id, ext = os.path.splitext(image_key)
    print(f"Id={unique_id}, Ext={ext}")

    thumbnail_sizes = [50, 100, 200]
    # download_path = f"/tmp/{}{}".format(uuid.uuid4(), key_upload)
    download_path = f"/tmp/{image_key}"
    upload_path = "/tmp/"

    # get the image from S3 and store it in /tmp
    try:
        print(
            f"Downloading Image from {bucket} with key {image_key} at {download_path}"
        )
        s3_client.download_file(bucket, image_key, download_path)
        # image_file = s3_client.get_object(Bucket=bucket, Key=image_key)
        image_list = []
        for size in thumbnail_sizes:
            thumbnail_filename = "thumbnail_" + unique_id + "_" + str(size) + ext
            print(f"Thumbnail Filename={thumbnail_filename}")
            generate_thumbnail(download_path, upload_path + thumbnail_filename, size)
            upload_thumbnail(
                upload_path + thumbnail_filename, f"thumbnails/{thumbnail_filename}"
            )
            thumbnail_url = f"https://{CDN_DOMAIN}/thumbnails/{thumbnail_filename}"
            image_list.append(thumbnail_url)
        report_image(unique_id, image_list)
    except ClientError as client_err:
        print("Unexpected error: " + str(client_err))
    except Exception as err:
        print("Unexpected error: " + str(err))


def generate_thumbnail(input_path, output_path, size):
    # Resize the image and save to /tmp
    with Image.open(input_path) as image:
        new_width = size
        new_height = image.height / (image.width / size)
        image.thumbnail(tuple((new_width, new_height)))
        image.save(output_path)
        print(f"Succcessfully Generated Thumbnail at {output_path}")


def upload_thumbnail(path, image_name):
    # Upload the thumbnail images in the destination S3
    try:
        print(f"Uploading Thumbnail at {path} to {TARGET_BUCKET}")

        s3_client.upload_file(path, TARGET_BUCKET, image_name)
    except ClientError as err:
        print("Unexpected error: " + str(err))


def report_image(unique_id, thumbnail_list):
    # Log thumbnail info in DynamoDB
    try:
        table = dynamodb_client.Table(TABLE_NAME)
        table.update_item(
            Key={"id": unique_id},
            UpdateExpression="set thumbnails = :t",
            ExpressionAttributeValues={":t": thumbnail_list},
        )

    except ClientError as err:
        print("Unexpected error: " + str(err))
