# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import builtins
import typing
from os import path

from constructs import Construct
import aws_cdk as cdk

from aws_cdk import aws_s3 as s3
from aws_cdk import aws_s3_deployment as s3_deployment
from aws_cdk import aws_cloudfront as cloudfront
from aws_cdk import aws_cloudfront_origins as origins
from aws_cdk import aws_ssm as ssm


class Frontend(cdk.Stack):
    def __init__(
        self,
        scope: Construct,
        _id: builtins.str,
    ) -> None:
        super().__init__(scope, _id)

        website_bucket = s3.Bucket(self, "website-bucket")

        api_endpoint = ssm.StringParameter.value_for_string_parameter(
            self, "backend-api-endpoint"
        )
        config = {"API_ENDPOINT": api_endpoint}

        s3_deployment.BucketDeployment(
            self,
            "website-deployment",
            destination_bucket=website_bucket,
            sources=[
                s3_deployment.Source.json_data("config.json", config),
                s3_deployment.Source.asset(
                    path.dirname(__file__),
                    bundling=cdk.BundlingOptions(
                        image=cdk.DockerImage.from_registry("node:lts"),
                        command=[
                            "bash",
                            "-c",
                            " && ".join(
                                [
                                    "yarn install",
                                    "yarn build",
                                    "cp -r /asset-input/dist/* /asset-output/",
                                ]
                            ),
                        ],
                    ),
                ),
            ],
        )

        oai = cloudfront.OriginAccessIdentity(self, "origin-access-identity")
        website_bucket.grant_read(oai)

        frontend_dist = cloudfront.Distribution(
            self,
            "distribution",
            default_root_object="index.html",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3Origin(website_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            ),
            enable_logging=True,
        )

        cdk.CfnOutput(
            self, "frontend-url", value=frontend_dist.distribution_domain_name
        )
