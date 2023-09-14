# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import typing
import builtins

import aws_cdk as cdk
from constructs import Construct
from aws_cdk import aws_s3 as s3
from aws_cdk import aws_cloudfront as cloudfront
from aws_cdk import aws_cloudfront_origins as origins
from aws_cdk import aws_s3_notifications as s3_notifications
from aws_cdk import aws_ssm as ssm


from backend.api import API


class Backend(cdk.Stack):
    def __init__(
        self,
        scope: typing.Optional[Construct] = None,
        _id: typing.Optional[builtins.str] = None,
    ) -> None:
        super().__init__(scope, _id)

        # create source & target bucket
        source_bucket = s3.Bucket(self, "source-bucket")
        target_bucket = s3.Bucket(self, "target-bucket")

        # create cloudfront distribution for media
        media_distribution = cloudfront.Distribution(
            self,
            "media-distribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3Origin(source_bucket)
            ),
        )
        media_distribution.add_behavior(
            "/thumbnails/*.*",
            origins.S3Origin(
                target_bucket,
            ),
        )

        cdn_domain = media_distribution.distribution_domain_name

        backend_api = API(self, "backend-api", source_bucket, target_bucket, cdn_domain)

        ssm.StringParameter(
            self,
            "backend-api-endpoint",
            string_value=backend_api.apigw.url,
            parameter_name="backend-api-endpoint",
        )

        # add bucket event notification for lambda
        source_bucket.add_event_notification(
            s3.EventType.OBJECT_CREATED,
            s3_notifications.LambdaDestination(backend_api.photo_processor_function),
        )
