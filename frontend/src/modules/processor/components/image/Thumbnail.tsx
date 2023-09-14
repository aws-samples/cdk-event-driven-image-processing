// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {Card, Flex, Image, Text} from "@aws-amplify/ui-react";
import "./thumbnail.css"

type ThumbnailSize = "s" | "m" | "l"
type ThumbnailProps = {
    size: "s" | "m" | "l",
    src: string,
    alt: string
}

const sizeMap: Record<ThumbnailSize, number> = {
    s: 50,
    m: 100,
    l: 150
}


export function Thumbnail(props: ThumbnailProps) {
    return <Flex direction={"column"} alignItems={{base: "center", large: "flex-start"}}>
        <Text fontSize={".875rem"} margin={"0 0 -.65rem 0"} fontWeight={400}>{sizeMap[props.size]} x {sizeMap[props.size]}</Text>
        <Card display={"flex"} variation={"elevated"} borderRadius={".75rem"} className={"m-processor--cp-thumb"}>
            <Image alt={props.alt} src={props.src} width={sizeMap[props.size]} height={sizeMap[props.size]} />
        </Card>
    </Flex>
}
