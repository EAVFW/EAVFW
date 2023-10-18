

import {
    Button, Divider, mergeClasses, ProgressBar, SelectTabEventHandler
} from "@fluentui/react-components";
import {
    Drawer, DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle, DrawerProps
} from "@fluentui/react-components/unstable";


import { Dismiss24Regular } from "@fluentui/react-icons";

import React, { useState } from "react";
import { useStackStyles } from "../useStackStyles";
import { useWizard } from "./useWizard";
import { WizardFooter } from "./WizardFooter";
import { WizardMessages } from "./WizardMessages";
import { WizardTabs } from "./WizardTabs";
import { WizardToaster } from "./WizardToaster";


export const WizardDrawer: React.FC = ({  }) => {

    const stack = useStackStyles();
   
   

    
        
    //  const [selectedTab, setSelectedTab] = useState(Object.keys(wizard?.tabs ?? {})[0]);
    //const selectedTab = useWizardTab() ?? Object.keys(wizard?.tabs ?? {})[0];
    const [{ tabName, wizard, isTransitioning }, { setSelectedTab, closeWizard }] = useWizard();
   
    const [detailedError, setDetailedError] = useState<string>();
    if (!tabName)
        return null;

    const onTabSelect: SelectTabEventHandler = (event, data) => {
        console.log("selected tab", data);
        setSelectedTab(data.value as string);
    };

   

    return (

        <Drawer position="end" size="large"
            type="overlay"
            separator
            open={typeof wizard !== "undefined"}
            onOpenChange={(_, { open }) => closeWizard()}
        >
            <ProgressBar shape="square" thickness="large" style={{ visibility: isTransitioning ? "visible" : "hidden" }} />
            <DrawerHeader>
                <DrawerHeaderTitle
                    action={
                        <Button
                            appearance="subtle"
                            aria-label="Close"
                            icon={<Dismiss24Regular />}
                            onClick={closeWizard}
                        />
                    }
                >
                    {wizard?.title}
                </DrawerHeaderTitle>
            </DrawerHeader>
            <DrawerBody>
                {detailedError && <div dangerouslySetInnerHTML={{ __html: detailedError }}></div>}
                <div className={mergeClasses(stack.root, stack.verticalFill)}>
                    <WizardToaster />
                    <WizardMessages setDetailedError={setDetailedError} />
                    <WizardTabs tabs={wizard?.tabs} className={stack.itemGrow} onTabSelect={onTabSelect} selectedTab={tabName} />
                    <Divider className={stack.itemShrink} />
                    <WizardFooter />
                </div>
            </DrawerBody>
        </Drawer>

    )
}