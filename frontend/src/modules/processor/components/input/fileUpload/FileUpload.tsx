// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {Card, Flex, Image, Loader, Text, useTheme, View} from "@aws-amplify/ui-react";
import {ChangeEvent, useRef} from "react";
import {FaImage} from "react-icons/fa";
import "./fileUpload.css";

type ImageTypes = "image/png" | "image/jpeg" | "image/gif"
type FileUploadProps = {
    fileTypes: ImageTypes[],
    onChangeFile: (file: Blob) => void,
    isProcessing: boolean,
    selectedFile: Blob | MediaSource | null
}

export function FileUpload(props: FileUploadProps) {
    const uploadRef = useRef<HTMLInputElement>(null);
    const theme = useTheme();

    const onUploadClick = () => {
        if (uploadRef.current && selectedFile === null) {
            uploadRef.current.click();
        }
    }

    const onImageUploaded = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            props.onChangeFile(e.target.files[0])
        }
    }

    const selectedFile = props.selectedFile ? URL.createObjectURL(props.selectedFile) : null;

    return <Card variation={"elevated"} className={"m-processor--cp-ifu"} flex={1} borderRadius={".75rem"}>
        <Flex onClick={onUploadClick} direction={"column"} flex={1} height={"100%"}>
            {selectedFile === null &&  <Flex direction={"column"} flex={1} className={"m-processor--cp-ifu_upload"} width={"100%"} height={"100%"} alignItems={"center"} justifyContent={"center"}>
                <View className={"m-processor--cp-ifu_placeholder"} border={`4px dashed ${theme.tokens.colors.brand.primary["60"].value}`}>
                    <FaImage style={{width: "100%", height: "100%", color: theme.tokens.colors.brand.primary["60"].value}} />
                </View>
                <Text>Click to upload an image</Text>
            </Flex>}
            {selectedFile && <Flex alignItems={"center"} height={"100%"} position={"relative"} className={"m-processor--cp-ifu_selected"}>
                <Image
                    className={"m-processor--cp-ifu_selected-img"}
                    alt={"Image to be processed"}
                    src={selectedFile}
                    width="100%"
                    height="100%"
                    maxHeight={"350px"}
                    objectFit="contain"/>
                <Flex direction={"column"} alignItems={"center"} justifyContent={"center"} className={"m-processor--cp-ifu_image"}>
                    <View className={"m-processor--cp-ifu_placeholder"}>
                        <Loader variation={"linear"} size={"small"} />
                    </View>
                </Flex>
            </Flex>}
            <input ref={uploadRef} onChange={onImageUploaded} type="file" style={{display: "none"}} accept={props.fileTypes.join(",")} />
        </Flex>
    </Card>
}