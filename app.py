# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

#!/usr/bin/env python3
import os

import aws_cdk as cdk
import cdk_nag as nag

# from sample.sample_stack import SampleStack
from backend.stack import Backend
from frontend.stack import Frontend


app = cdk.App()

# create backend stack
Backend(app, "backend")
# create frontend stack and provide backend API endpoint
Frontend(app, "frontend")

cdk.Aspects.of(app).add(nag.AwsSolutionsChecks(verbose=True))

app.synth()
