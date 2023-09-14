// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {useContext} from "react";
import {ConfigContext} from "./ConfigProvider.tsx";


export function useConfig() {
    const value = useContext(ConfigContext);
    return value ?? {API_ENDPOINT: import.meta.env.VITE_API_URL};
}