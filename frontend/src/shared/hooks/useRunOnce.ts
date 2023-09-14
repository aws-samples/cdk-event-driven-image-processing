// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {useEffect, useRef} from "react";

/**
 * Hook to ensure a function is only execute once during callers lifetime.
 * @param fn
 */
function useRunOnce<T>(fn: () => T) {
    const hasRun = useRef(false);
    useEffect(() => {
        if(!hasRun.current) {
            fn();
            hasRun.current = true;
        }
    });
}

export {useRunOnce}