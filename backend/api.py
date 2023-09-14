# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import builtins
from os import path

from constructs import Construct
from aws_cdk import aws_s3 as s3
from aws_cdk import aws_lambda as lambda_
from aws_cdk import aws_dynamodb as dynamodb
from aws_cdk import aws_apigateway as apigw
from aws_cdk import aws_logs as logs
import aws_cdk as cdk

from cdk_aws_lambda_powertools_layer import LambdaPowertoolsLayer


class API(Construct):
    def __init__(
        self,
        scope: Construct,
        _id: builtins.str,
        source_bucket: s3.IBucket,
        target_bucket: s3.IBucket,
        cdn_domain: str,
    ) -> None:
        super().__init__(scope, _id)

        # create dynamodb table to store metadata
        self.photos_table = dynamodb.Table(
            self,
            "photos-table",
            partition_key=dynamodb.Attribute(
                name="id", type=dynamodb.AttributeType.STRING
            ),
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )

        # create a python based lambda function
        self.photo_processor_function = lambda_.Function(
            self,
            "photo-processor-func",
            runtime=lambda_.Runtime.PYTHON_3_9,
            code=lambda_.Code.from_asset(
                path.join(path.dirname(__file__), "photo-processor"),
                bundling={
                    "image": lambda_.Runtime.PYTHON_3_9.bundling_image,
                    "command": [
                        "bash",
                        "-c",
                        "pip install --platform manylinux2014_x86_64 -t /asset-output --implementation cp --python 3.9 --only-binary=:all: --upgrade Pillow && cp -au . /asset-output",
                    ],
                },
            ),
            handler="index.handler",
            memory_size=2048,
            timeout=cdk.Duration.seconds(300),
            environment={
                "TABLE_NAME": self.photos_table.table_name,
                "TARGET_BUCKET": target_bucket.bucket_name,
                "CDN_DOMAIN": cdn_domain,
            },
        )

        photo_processor_fn_role = self.photo_processor_function.role
        source_bucket.grant_read(photo_processor_fn_role)
        target_bucket.grant_write(photo_processor_fn_role)
        self.photos_table.grant_write_data(photo_processor_fn_role)

        lambda_powertools_layer = LambdaPowertoolsLayer(self, "lambda-powertools-layer")

        self.rest_backend_func = lambda_.Function(
            self,
            "rest-backend-func",
            runtime=lambda_.Runtime.PYTHON_3_9,
            code=lambda_.Code.from_asset(
                path.join(path.dirname(__file__), "rest-backed")
            ),
            handler="index.handler",
            layers=[lambda_powertools_layer],
            environment={
                "TABLE_NAME": self.photos_table.table_name,
                "SOURCE_BUCKET": source_bucket.bucket_name,
                "CDN_DOMAIN": cdn_domain,
            },
        )

        rest_backend_func_role = self.rest_backend_func.role
        source_bucket.grant_read_write(rest_backend_func_role)
        self.photos_table.grant_read_write_data(rest_backend_func_role)

        access_logs = logs.LogGroup(
            self,
            "access-logs",
            log_group_name="rest-api-access-logs",
            retention=logs.RetentionDays.ONE_WEEK,
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )

        self.apigw = apigw.LambdaRestApi(
            self,
            "rest-api",
            handler=self.rest_backend_func,
            binary_media_types=["image/jpeg", "image/png"],
            default_cors_preflight_options=apigw.CorsOptions(
                allow_origins=apigw.Cors.ALL_ORIGINS,
                allow_methods=apigw.Cors.ALL_METHODS,
            ),
            cloud_watch_role=True,
            deploy_options=apigw.StageOptions(
                tracing_enabled=True,
                logging_level=apigw.MethodLoggingLevel.INFO,
                access_log_destination=apigw.LogGroupLogDestination(access_logs),
                access_log_format=apigw.AccessLogFormat.json_with_standard_fields(
                    caller=True,
                    http_method=True,
                    ip=True,
                    protocol=True,
                    request_time=True,
                    resource_path=True,
                    response_length=True,
                    status=True,
                    user=True,
                ),
            ),
        )
