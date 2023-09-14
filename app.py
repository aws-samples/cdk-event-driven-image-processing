# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

#!/usr/bin/env python3
import os

import aws_cdk as cdk

from backend.stack import Backend
from frontend.stack import Frontend


app = cdk.App()

# create backend stack
Backend(app, "backend")
# create frontend stack and provide backend API endpoint
Frontend(app, "frontend")

app.synth()
