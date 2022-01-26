import React, { useRef, useState } from "react";
import { IPivotProps, Pivot, PivotItem } from "@fluentui/react";


import TabComponent from "./TabComponent";
import { useRouter } from "next/router";
import { useChangeDetector } from "@eavfw/hooks";
import { EntityDefinition, FormDefinition, FormTabDefinition } from "@eavfw/manifest";
import { useTabProvider } from "../Tabs/useTabProvider";
import { OptionsFactory } from "./OptionsFactory";
import { FormValidation } from "../FormValidation";

type FormComponentProps<T> = {
    form: FormDefinition;
    tabs: string[];
    getTabName: (tab: FormTabDefinition) => string;
    entity: EntityDefinition;
    formName: string;
    locale: string;
    formData: T;
    onFormDataChange?: (formdata: T) => void;
    factory?: OptionsFactory;
    formContext?: any;
    extraErrors?: FormValidation;
};

const pivotItemStyle = {
    height: 'calc(100vh - 44px)',
    overflow: 'auto',
}

const FormComponent = <T,>(props: FormComponentProps<T>) => {
    const {
        form,
        tabs,
        getTabName,
        entity,
        formName,
        formData,
        onFormDataChange,
        formContext,
        extraErrors
    } = props;
    console.group("FormComponent: " + formName);

    const renderId = useRef(new Date().toISOString());
    renderId.current = new Date().toISOString();
    useChangeDetector("FormComponent: form", form, renderId);
    useChangeDetector("FormComponent: tabs", tabs, renderId);
    useChangeDetector("FormComponent: getTabName", getTabName, renderId);
    useChangeDetector("FormComponent: entity", entity, renderId);
    useChangeDetector("FormComponent: formName", formName, renderId);
    useChangeDetector("FormComponent: formData", formData, renderId);
    useChangeDetector("FormComponent: onFormDataChange", onFormDataChange, renderId);
    const router = useRouter();

    const styles: IPivotProps["styles"] = {
        //root: {height: "100%"},
        itemContainer: { flexGrow: 1 },
    };


    if (form?.type === "QuickCreate") {
        const [tabName, tab] = Object.entries(form.layout.tabs)[0];

        return <TabComponent key={tabName}
            entityName={entity.logicalName}
            form={form}
            formData={formData}
            columns={tab.columns}
            tabName={tabName}
            entity={entity}
            formName={formName}
            locale={props.locale}
            onFormDataChange={onFormDataChange}
            factory={props.factory}
            formContext={formContext}
            extraErrors={extraErrors}
        />
    }


    const { onTabChange, tabName } = useTabProvider();



    const ui = (
        <Pivot className="form-tabs" onLinkClick={onTabChange} selectedKey={tabName} style={{ height: "100%", display: "flex", flexDirection: "column" }} styles={styles}>
            {tabs.filter(tabName => form.layout.tabs[tabName]).map((tabName, idx) => {
                const tab = form.layout.tabs[tabName];
                return (
                    <PivotItem className="form-tab"
                        headerText={getTabName(tab) ?? tabName}
                        key={tabName}
                        itemKey={tabName}
                    >
                        <TabComponent key={tabName}
                            entityName={entity.logicalName}
                            form={form}
                            formData={formData}
                            columns={tab.columns}
                            tabName={tabName}
                            entity={entity}
                            formName={formName}
                            locale={props.locale}
                            onFormDataChange={onFormDataChange}
                            factory={props.factory}
                            formContext={formContext}
                            extraErrors={extraErrors}
                        />
                    </PivotItem>
                );
            })}
        </Pivot>
    );
    console.groupEnd();
    return ui;
};

export default FormComponent;
