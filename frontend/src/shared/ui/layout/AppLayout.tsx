// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {View, Grid, Flex} from "@aws-amplify/ui-react";
import React from "react";

type AppLayoutProps = {
    header?: React.ReactElement | null,
    canvas: React.ReactElement | null,
    footer?: React.ReactElement | null
}
export function AppLayout(props: AppLayoutProps) {
    return <Grid
        templateColumns="1fr"
        templateRows=".5fr 8fr .5fr"
        width={"100vw"}
        height={"100vh"}
    >
        <View
            columnStart="1"
            columnEnd="-1"
        >
            {props.header}
        </View>
        <Flex
            columnStart="1"
            columnEnd="-1"
            justifyContent={"center"}
            alignItems={"center"}
        >
            {props.canvas}
        </Flex>
        <View
            columnStart="1"
            columnEnd="-1"
        >
            {props.footer}
        </View>
    </Grid>
}