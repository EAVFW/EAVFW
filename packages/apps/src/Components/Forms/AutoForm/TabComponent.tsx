import React, { useRef } from "react";
import { Stack } from "@fluentui/react";

import ColumnComponent, { ColumnComponentSlim } from "./ColumnComponent";

import { EntityDefinition, FormDefinition, FormTabDefinition, FormTabDefinitionWithColumns } from "@eavfw/manifest";
import { useChangeDetector } from "@eavfw/hooks";
import { OptionsFactory } from "./OptionsFactory";
import { FormValidation } from "@rjsf/utils";
import { Controls, ResolveFeature } from "../../..";
import { makeStyles, shorthands, Spinner } from "@fluentui/react-components";



type TabComponentProps<T> = {
    form: FormDefinition;
    columns?: FormTabDefinitionWithColumns["columns"];
    tabName: string;
    entity: EntityDefinition;
    formName: string;
    locale: string;
    entityName: string;
    formData: T;
    onFormDataChange?: (formdata: T) => void;
    factory?: OptionsFactory;
    formContext?: any;
    extraErrors?: FormValidation;
};

const StackTokens = { childrenGap: 25 };
const TabComponent = <T extends { id?: string, [key: string]: any }>(props: TabComponentProps<T>) => {
    const { form, columns, tabName, entity, formName, formData, onFormDataChange, locale, factory, entityName, formContext, extraErrors } = props;
    try {
        console.group("Tabcomponent: Tab: " + tabName);

        const renderId = useRef(new Date().toISOString());
        renderId.current = new Date().toISOString();
        useChangeDetector(`Tabcomponent: Tab: ${tabName} form`, form, renderId);
        useChangeDetector(`Tabcomponent: Tab: ${tabName} columns`, columns, renderId);
        useChangeDetector(`Tabcomponent: Tab: ${tabName} tabName`, tabName, renderId);
        useChangeDetector(`Tabcomponent: Tab: ${tabName} entity`, entity, renderId);
        useChangeDetector(`Tabcomponent: Tab: ${tabName} formName`, formName, renderId);
        useChangeDetector(`Tabcomponent: Tab: ${tabName} formData`, formData, renderId);
        useChangeDetector(`Tabcomponent: Tab: ${tabName} onFormDataChange`, onFormDataChange, renderId);
        useChangeDetector(`Tabcomponent: Tab: ${tabName} factory`, factory, renderId);
        useChangeDetector(`Tabcomponent: Tab: ${tabName} locale`, locale, renderId);

        if (!columns || Object.keys(columns).length===0) {

            const controlName = form.layout.tabs[tabName].control;
            if (controlName && controlName in Controls) {
                const Component = Controls[controlName];


                return <Stack verticalFill horizontal tokens={StackTokens}><Component /></Stack>
            }
            throw new Error("Control or Columns must be defined, or control is not registered");
        }

        console.log("Rendering tab", [Controls, columns]);
        const ui = (
            <Stack verticalFill horizontal tokens={{ childrenGap:25 }} styles={{
                root: {
                    display: "grid",
                    gridTemplateColumns: `${Object.keys(columns).map(c => '1fr').join(' ')};`
                }
            }}>
                {Object.keys(columns).map((columnName, idx) => (
                    <Stack.Item className={columnName} grow key={columnName}>
                        <ColumnComponent<T>
                            form={form}
                            sections={columns[columnName].sections}
                            tabName={tabName}
                            columnName={columnName}
                            entity={entity}
                            formName={formName}
                            formData={formData}
                            onFormDataChange={onFormDataChange}
                            locale={locale}
                            entityName={entityName}
                            factory={factory}
                            formContext={formContext}
                            extraErrors={extraErrors}
                        />
                    </Stack.Item>
                ))}
            </Stack>
        );
        return ui;
    } finally {
        console.groupEnd();
    }
};

export default TabComponent;

