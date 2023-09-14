// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {useTypedAsync} from "../../../shared/hooks/useAsync.ts";
import {useIntervalAsync} from "../../../shared/hooks/useIntervalAsync.ts";
import {Config} from "../../../shared/models/config.ts";
import {useConfig} from "../../../shared/hooks/useConfig.ts";


type ProcessorResponse = {
    id: string,
    image_name: string
}

type ProcessorRequest =  {
    image: Blob
}

type GetResultRequest =  {
    id: string
}

export type GetResultResponse = {
    thumbnails: string[]
}

async function getResult({id, API_ENDPOINT}: GetResultRequest & Config): Promise<GetResultResponse> {
    const response = await fetch(`${API_ENDPOINT}thumbnails/${id}`);
    return response.json();
}
async function processImage({image, API_ENDPOINT}: ProcessorRequest & Config): Promise<ProcessorResponse> {
    const response = await fetch(`${API_ENDPOINT}upload`, {
        mode: "cors",
        body: image,
        method: "POST"
    });

    return response.json();
}

function isValidResponse(response: GetResultResponse | null) {
    return (response?.thumbnails?.length ?? 0)  > 0
}

export function useProcessor() {
    const config = useConfig();
    const processor = useTypedAsync((props: ProcessorRequest) => processImage({...props, ...config}), false);
    const getResults = useTypedAsync((props: GetResultRequest) => getResult({...props, ...config}), false);


    const shouldRunPolling = () => {
        const images = getResults.value?.thumbnails ?? [];
        const id = processor.value?.id ?? "";
        return id.length > 0 && images.length === 0 && getResults.error === null;
    }

    useIntervalAsync(async () => {
        getResults.execute({id: processor.value!.id, ...config})
    }, 1000, shouldRunPolling)

    return {
        status: getResults.isLoading ? getResults.status : processor.status,
        isProcessing: processor.isLoading,
        isPolling: getResults.isLoading,
        isLoading: processor.isLoading || getResults.isLoading,
        value: isValidResponse(getResults.value) ? getResults.value! : null,
        error: getResults.error ?? processor.error,
        execute: ({image}: ProcessorRequest) => processor.execute({image, ...config}),
        reset: () => {
            processor.reset();
            getResults.reset();
        }
    }

}