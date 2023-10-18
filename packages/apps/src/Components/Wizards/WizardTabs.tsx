import { FormTabDefinitionWithColumns, WizardTabsDefinition } from "@eavfw/manifest"
import { mergeClasses, SelectTabData, SelectTabEvent, Tab, TabList, TabListProps, TabValue } from "@fluentui/react-components"
import { ChevronCircleDown32Regular, ChevronCircleDown32Filled } from "@fluentui/react-icons"
import { useState } from "react"
import { ResolveFeature } from "../.."
import { useModelDrivenApp } from "../../useModelDrivenApp"
import { useStackStyles } from "../useStackStyles"
import { useWizard } from "./useWizard"
import { WizardTab } from "./WizardTab"





export const WizardTabs: React.FC<{ tabs?: WizardTabsDefinition, className?: string, selectedTab?: string, onTabSelect: TabListProps["onTabSelect"] }> = (
    { tabs = {}, className, selectedTab = Object.keys(tabs)[0], onTabSelect }
) => {
    const stack = useStackStyles();
    const app = useModelDrivenApp();

    const [{ expressions }] = useWizard(); 


    if (!selectedTab)
        return null;

    const tabmodel = tabs[selectedTab];

    if (!tabmodel)
        return null;


  

    const tabsRendere = () => {
        return Object.entries(tabs)
            .filter(([key, value]) => typeof value.visible === "undefined" || (typeof value.visible === "boolean" && value.visible) || (typeof value.visible === "string" && expressions[value.visible]))
            .map(([key, tab]) => <Tab key={key} disabled={Object.keys(tabs).indexOf(key) > Object.keys(tabs).indexOf(selectedTab)} icon={Object.keys(tabs).indexOf(key) < Object.keys(tabs).indexOf(selectedTab) ? <ChevronCircleDown32Filled /> : <ChevronCircleDown32Regular />} value={key}>{tab?.locale?.[app.locale]?.title ?? tab.title ?? key}</Tab>)
    }
  
 
    

    return (
        <div className={mergeClasses(stack.root, stack.horizontal, className)}>
            <TabList size="large" selectedValue={selectedTab} onTabSelect={onTabSelect} vertical>
                {tabsRendere()}
            </TabList>
            <WizardTab className={mergeClasses(stack.itemGrow)} columns={tabmodel.columns} controlName={tabmodel.control} />
        </div>
    )
}