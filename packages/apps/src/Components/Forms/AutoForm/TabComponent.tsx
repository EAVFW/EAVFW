import React, { useRef } from "react";
import { Stack } from "@fluentui/react";

import ColumnComponent from "./ColumnComponent";

import { EntityDefinition, FormDefinition, FormTabDefinition } from "@eavfw/manifest";
import { useChangeDetector } from "@eavfw/hooks";
import { OptionsFactory } from "./OptionsFactory";
import { FormValidation } from "../FormValidation";

type TabComponentProps<T> = {
    form: FormDefinition;
    columns: FormTabDefinition["columns"];
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

const TabComponent = <T,>(props: TabComponentProps<T>) => {
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

        console.log("Rendering tab");
        const ui = (
            <Stack verticalFill horizontal gap={25} styles={{
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
