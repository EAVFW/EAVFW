import { useModelDrivenApp } from "../useModelDrivenApp";
import { PageLayoutProps } from "./PageLayoutProps";

import { useRouter } from "next/router";
import React, { createContext, SetStateAction, useContext, useEffect, useState } from "react";
import { IRecord } from "@eavfw/manifest";
import { IObjectWithKey, ScrollablePane, ScrollbarVisibility, Selection, Stack, Sticky, StickyPositionType } from "@fluentui/react";
import { ModelDrivenGridViewerState } from "../Components/Views/ModelDrivenGridViewer";
import { ModelDrivenGridViewerSelectedContext } from "../Components/Selection/ModelDrivenGridViewerSelectedContext";
import { RibbonContextProvider } from "../Components/Ribbon/RibbonContextProvider";
import MessageArea, { MessagesProvider } from "../Components/MessageArea/MessageContext";
import ProgressBar, { ProgressBarProvider } from "../Components/ProgressBar/ProgressBarContext";
import { TopBar } from "../Components/TopBar/ModelDrivenTopBar";
import { ResolveFeature } from "../FeatureFlags";
import { PageStackStyles } from "./PageStackStyles";
import ModelDrivenNavigation from "../Components/Navigation/ModelDrivenNavigation";
import { RibbonBar } from "../Components/Ribbon/RibbonBar";
import { WizardDrawer } from "../Components/Wizards/WizardDrawer";
import { WizardProvider } from "../Components/Wizards/WizardProvider";

const FormLayoutContext = createContext({

    mutator: { mutate: () => { } },
    setMutator: (a: SetStateAction<{ mutate: () => void }>) => { }
});
export const useFormLayoutContext = () => useContext(FormLayoutContext);

export function FormLayout(props: PageLayoutProps) {
    if (!props.sitemap)
        return <div>loading</div>;

    const app = useModelDrivenApp();
    const router = useRouter();

    const [selection, setSelection] = useState<Selection<Partial<IRecord> & IObjectWithKey>>(new Selection<Partial<IRecord> & IObjectWithKey>({
        onSelectionChanged: () => {


            setselectionDetails(_getSelectionDetails())
        },
    }));

    function _getSelectionDetails(): string {
        const selectionCount = selection?.getSelectedCount();

        switch (selectionCount) {
            case 0:
                return 'No items selected';
            case 1:
                return '1 item selected: ' + (selection?.getSelection()[0] as IRecord).name;
            default:
                return `${selectionCount} items selected`;
        }
    }

    const [selectionDetails, setselectionDetails] = useState<ModelDrivenGridViewerState["selectionDetails"]>(_getSelectionDetails());
    const [mutater, setMutator] = useState({ mutate: () => { } });
    const topBarTheme = ResolveFeature("topBarTheme");






    return (
        <ModelDrivenGridViewerSelectedContext.Provider value={{ setSelection, selection: selection!, selectionDetails }}>
            <FormLayoutContext.Provider value={{ mutator: mutater, setMutator: setMutator }}>
                <WizardProvider>
                    <RibbonContextProvider>
                        <Stack verticalFill>

                            <MessagesProvider>
                                <ProgressBarProvider>
                                    <TopBar theme={topBarTheme} title={props.title} search={true} />

                                    <Stack grow styles={PageStackStyles} style={{ overflow: "hidden" }} horizontal verticalFill>
                                        <ModelDrivenNavigation sitemap={props.sitemap} theme={topBarTheme} />
                                        <WizardDrawer />

                                        <Stack.Item grow>

                                            <Stack verticalFill>
                                                <RibbonBar />
                                                <MessageArea />
                                                <Stack.Item grow style={{ position: "relative" }}>

                                                    <ScrollablePane scrollbarVisibility={ScrollbarVisibility.always} >
                                                        <Sticky stickyPosition={StickyPositionType.Header} ><ProgressBar /></Sticky>
                                                        {props.children}
                                                    </ScrollablePane>
                                                </Stack.Item>
                                            </Stack>

                                        </Stack.Item>
                                    </Stack>
                                </ProgressBarProvider>
                            </MessagesProvider>


                        </Stack>
                    </RibbonContextProvider>
                </WizardProvider>
            </FormLayoutContext.Provider>
        </ModelDrivenGridViewerSelectedContext.Provider>
    );
} 