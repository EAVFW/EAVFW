import React, { useRef } from "react";
import { Stack } from "@fluentui/react";

import { EntityDefinition, FormDefinition, FormTabDefinition } from "@eavfw/manifest";
import { useChangeDetector } from "@eavfw/hooks";
import { OptionsFactory } from "./OptionsFactory";
import { SectionComponent } from "./SectionComponent/SectionComponent";
import { FormValidation } from "../FormValidation";


export type ColumnComponentProps<T> = {
    form: FormDefinition;
    sections: FormTabDefinition["columns"][""]["sections"];
    tabName: string;
    columnName: string;
    entityName: string;
    entity: EntityDefinition;
    formName: string;
    locale: string;
    formData: T;
    onFormDataChange?: (formdata: T) => void;
    factory?: OptionsFactory;
    formContext?: any;
    extraErrors?: FormValidation;
};

const ColumnComponent = <T,>(props: ColumnComponentProps<T>) => {
    const {
        form,
        sections,
        tabName,
        columnName,
        entity,
        formName,
        formData,
        onFormDataChange,
        locale,
        factory,
        entityName,
        formContext,
        extraErrors
    } = props;
    try {
        console.group("ColumnComponent: Column: " + columnName);

        const renderId = useRef(new Date().toISOString());
        renderId.current = new Date().toISOString();
        useChangeDetector(`ColumnComponent: Tab: ${tabName} Column: ${columnName} form`, form, renderId);
        useChangeDetector(`ColumnComponent: Tab: ${tabName} Column: ${columnName} sections`, sections, renderId);
        useChangeDetector(`ColumnComponent: Tab: ${tabName} Column: ${columnName} tabName`, tabName, renderId);
        useChangeDetector(`ColumnComponent: Tab: ${tabName} Column: ${columnName} columnName`, columnName, renderId);
        useChangeDetector(`ColumnComponent: Tab: ${tabName} Column: ${columnName} entity`, entity, renderId);
        useChangeDetector(`ColumnComponent: Tab: ${tabName} Column: ${columnName} formName`, formName, renderId);
        useChangeDetector(`ColumnComponent: Tab: ${tabName} Column: ${columnName} formData`, formData, renderId);
        useChangeDetector(`ColumnComponent: Tab: ${tabName} Column: ${columnName} onFormDataChange`, onFormDataChange, renderId);
        useChangeDetector(`ColumnComponent: Tab: ${tabName} Column: ${columnName} locale`, locale, renderId);
        useChangeDetector(`ColumnComponent: Tab: ${tabName} Column: ${columnName} factory`, factory, renderId);

        const ui = (
            <Stack verticalFill className="form-column">
                {Object.keys(sections).map((sectionName, idx) => (
                    <Stack.Item  grow key={sectionName}>
                        <SectionComponent<T>
                            form={form}
                            tabName={tabName}
                            columnName={columnName}
                            sectionName={sectionName}
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

export default ColumnComponent;
