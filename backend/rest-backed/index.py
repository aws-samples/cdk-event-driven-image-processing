# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import uuid
import os
import base64

from aws_lambda_powertools.event_handler.api_gateway import (
    APIGatewayRestResolver,
    CORSConfig,
)
from aws_lambda_powertools.event_handler.exceptions import InternalServerError
from aws_lambda_powertools.utilities.typing import LambdaContext

import boto3
from botocore.exceptions import ClientError

cors_config = CORSConfig(allow_origin="*")
app = APIGatewayRestResolver(cors=cors_config)

s3_client = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

@app.post("/upload")
def upload():
    bucket = os.environ.get("SOURCE_BUCKET")
    table_name = os.environ.get("TABLE_NAME")
    cdn_domain = os.environ.get("CDN_DOMAIN")
    unique_id = uuid.uuid4()
    image_url = ""

    content_type = app.current_event.get_header_value(name="Content-Type")
    file_extension = ""
    if content_type == "image/png":
        file_extension = ".png"

    if content_type == "image/jpeg":
        file_extension = ".jpg"

    file_name = str(unique_id) + file_extension
    content = base64.b64decode(app.current_event.body)
    try:
        _ = s3_client.put_object(Body=content, Bucket=bucket, Key=file_name)
        image_url = f"https://{cdn_domain}/{file_name}"
        table = dynamodb.Table(table_name)
        _ = table.put_item(
            Item={
                "image_name": image_url,
                "id": str(unique_id),
            },
        )
    except ClientError as error:
        raise InternalServerError(error) from error

    return {"id": str(unique_id), "image_name": image_url}, 201


@app.get("/thumbnails/<id>")
def thumbnails(id: str):
    table_name = os.environ.get("TABLE_NAME")
    try:
        table = dynamodb.Table(table_name)
        response = table.get_item(Key={"id": id})
        print(response["Item"])
        return response["Item"]
    except ClientError as error:
        print(f"Unexpected error: {error}")
        raise InternalServerError(error) from error


def handler(event: dict, context: LambdaContext):
    return app.resolve(event, context)
