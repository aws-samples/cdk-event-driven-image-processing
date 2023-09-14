// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {ThemeProvider, View} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import {AppLayout} from "./shared/ui/layout/AppLayout.tsx";
import {IndexPage} from "./modules/processor/pages";
import {theme} from "./shared/ui/theme.ts";
import {ConfigProvider} from "./shared/hooks/ConfigProvider.tsx";

function App() {
    return (
        <ThemeProvider theme={theme}>
            <ConfigProvider>
                <AppLayout header={<View padding={{base: "2rem 2rem 1rem 2rem", large: "2rem 3rem 0 3rem"}}></View>} canvas={<IndexPage />} />
            </ConfigProvider>
        </ThemeProvider>
    );
}

export default App;
