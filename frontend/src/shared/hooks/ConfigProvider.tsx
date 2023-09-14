// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from "react";
import {Config} from "../models/config.ts";
import {useAsync} from "./useAsync.ts";
import {useRunOnce} from "./useRunOnce.ts";

export const ConfigContext = React.createContext<Config | null>(null);

type ConfigProviderProps = {
    children: React.ReactNode,
    initialValue?: Config | null,
}

async function getConfig() {
    const response = await fetch("/config.json");
    return response.json();
}
export function ConfigProvider(props: ConfigProviderProps) {
    const getConfigTask = useAsync(getConfig, false);
    useRunOnce(() => {
        getConfigTask.execute();
    });

    return <ConfigContext.Provider value={getConfigTask?.value ?? props.initialValue}>{props.children}</ConfigContext.Provider>
}
