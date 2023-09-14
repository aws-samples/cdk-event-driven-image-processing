// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useState, useCallback, useEffect } from "react";

export type Args = any[];
export interface AsyncExecution<T> {
    execute: (...args: Args) => Promise<T | null>,
    reset: () => void
}

export interface TypedAsyncExecution<Tin, Tout> {
    execute: (args: Tin) => Promise<Tout | null>,
    reset: () => void
}

export type States = "idle" | "pending" | "success" | "error";
export interface AsyncState<T, E = string> {
    status: States,
    value: T | null,
    error: E | null,
    isLoading: boolean,
}

export type AsyncReturn<T, E = string> = AsyncState<T, E> & AsyncExecution<T>;
export type TypeAsyncReturn<Tin, Tout, E=string> = AsyncState<Tout,  E> & TypedAsyncExecution<Tin, Tout>
/**
 * Wraps an async function and returns status, error, and value props. Favor useTypedAsync where possible
 * @param asyncFunction {function} the async function to wrap
 * @param immediate {boolean} should the async function immediately execute
 * @returns {AsyncReturn} object contains a trigger for the function and state
 */
function useAsync<T, E = string>(asyncFunction: (...args: Args) => Promise<T | null>, immediate = true): AsyncReturn<T, E> {
    const [state, setState] = useState<AsyncState<T, E>>({status: "idle", value: null, error: null, isLoading: false});

    // The execute function wraps asyncFunction and
    // handles setting state for pending, value, and error.
    // useCallback ensures the below useEffect is not called
    // on every render, but only if asyncFunction changes.
    const execute = useCallback(async (...args: Args) => {
        // reset state
        setState(s => ({...s, status: "pending", value: null, error: null}));
        try {
            // execute async function
            const response: any = await asyncFunction(...args);
            // set result state
            setState(s => ({...s, status: "success", value: response}));
            return response;
        } catch(error: any) {
            // set error state
            setState(s => ({...s, status: "error", value: null, error}));
            return null;
        }

    }, [asyncFunction]);

    // Call execute if we want to fire it right away.
    // Otherwise execute can be called later, such as
    // in an onClick handler.
    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    const reset = () => setState({status: "idle", value: null, error: null, isLoading: false})

    return { execute, ...state, isLoading: state.status === "pending", reset };
}

/**
 * Wraps an async function and returns status, error, and value props.
 * @param asyncFunction {function} the async function to wrap
 * @param immediate {boolean} should the async function immediately execute
 * @returns {AsyncReturn} object contains a trigger for the function and state
 */
function useTypedAsync<Tin, Tout, E=string>(asyncFunction: (args: Tin) => Promise<Tout | null>, immediate = false): TypeAsyncReturn<Tin, Tout, E> {
    const asyncWrapper = useAsync<Tout, E>(asyncFunction, immediate);
    const executor = (args: Tin) => asyncWrapper.execute(args);
    return {
        ...asyncWrapper,
        execute: executor,
    }
}

export {useAsync, useTypedAsync};