// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useTheme, View, Flex, Text, Heading, Button } from "@aws-amplify/ui-react";
import "./index.css";
import { FileUpload } from "../components/input/fileUpload/FileUpload.tsx";
import { useEffect, useState } from "react";
import { Thumbnail } from "../components/image/Thumbnail.tsx";
import { useProcessor } from "../hooks/useProcessor.ts";


export function IndexPage() {
    const theme = useTheme();
    const [file, setFile] = useState<Blob | MediaSource | null>(null);
    const processor = useProcessor();

    useEffect(() => {
        function processImage() {
            const blob = file! as Blob;
            processor.execute({ image: new File([blob], blob.name, { type: blob.type }) })
        }
        if (file !== null) {
            processImage();
        }

        if (file === null) {
            processor.reset();
        }

    }, [file]);

    const onChangeFile = (source: Blob) => {
        setFile(source);
    }
    const onRemoveFile = () => setFile(null);

    return <View width={{ base: "100%", large: "80%" }} maxHeight={{ base: "inherit", large: "850px" }} height={processor.value === null ? "100%" : "fit-content"} borderRadius={{ base: "0", large: "2rem" }} backgroundColor={theme.tokens.colors.background.secondary} className={"m-processor--pg-index"}>
        <Flex
            padding={{ base: "1rem", large: "5rem 8rem" }}
            height={"100%"}
            direction={"column"}
        >
            <Flex direction={"column"} alignItems={"center"} justifyContent={"center"}>
                <Heading level={2} fontWeight={600}>Upload your image</Heading>
                <Text color={theme.tokens.colors.neutral["60"]}>PNG and JPG files are allowed</Text>
            </Flex>
            <Flex flex={processor.value === null ? 1 : 0} padding={{ base: "0", large: processor.value === null ? "2rem 0 0 0" : "0" }} direction={{ base: "column", large: processor.value === null ? "row" : "column" }}>
                <Flex direction={"column"} flex={1} alignItems={"center"}>
                    {processor.value === null && <FileUpload isProcessing={file !== null} onChangeFile={onChangeFile} fileTypes={["image/png", "image/jpeg"]} selectedFile={file} />}
                    {processor.value !== null && file !== null ? <Button onClick={onRemoveFile} width={"fit-content"} variation={"primary"}>Reset</Button> : null}
                </Flex>
                <Flex flex={processor.value === null ? 0 : 1} direction={{ base: "column", large: "row" }} alignItems={{ base: "center", large: "flex-start" }} margin={"1rem"} justifyContent={"center"}>
                    {processor.value !== null && file !== null && <>
                        <Thumbnail size={"s"} src={processor.value!.thumbnails[0]} alt={"50x50 thumbnail"} />
                        <Thumbnail size={"m"} src={processor.value!.thumbnails[1]} alt={"100x100 thumbnail"} />
                        <Thumbnail size={"l"} src={processor.value!.thumbnails[2]} alt={"150x150 thumbnail"} />
                    </>}
                </Flex>
            </Flex>
        </Flex>
    </View>
}