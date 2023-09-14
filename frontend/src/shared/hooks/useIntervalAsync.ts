// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {useEffect, useLayoutEffect, useRef} from "react";

export type UseIntervalAsyncDependencies = {
    setTimeout: (fn: () => void, delay?: number) => NodeJS.Timeout
}
export function useIntervalAsync(callback: () => Promise<void>, delay: number | null, shouldRun: () => boolean, onError?: (error: any) => void, dependencies?: UseIntervalAsyncDependencies) {
    const savedCallback = useRef(callback)
    const timeoutId = useRef<NodeJS.Timeout | null>(null);
    const timeout = dependencies?.setTimeout ?? setTimeout;
    const invokeCallback = async () => {

        try {
            if (shouldRun()) {
                await savedCallback.current();
            }
            if ((delay ?? -1) > -1) {
                timeoutId.current = timeout(() => {
                    invokeCallback()
                }, delay!)
            }
        } catch (e: any) {
            if (onError) {
                onError(e);
            }
        }

    }

    // Remember the latest callback if it changes.
    useLayoutEffect(() => {
        savedCallback.current = callback
    }, [callback])

    // Set up the timeout.
    useEffect(() => {
        // Don't schedule if no delay is specified.
        // Note: 0 is a valid value for delay.
        if (!delay && delay !== 0) {
            return
        }

        timeoutId.current = timeout(() => {
            invokeCallback()
        }, delay)

        return () => {
            if (timeoutId.current) {
                clearInterval(timeoutId.current);
            }
        }
    }, [delay, invokeCallback, timeout])

}