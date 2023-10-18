import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";



import isEqual from "react-fast-compare";


import { useBoolean } from "@fluentui/react-hooks";
import { SectionComponentProps } from "./SectionComponentProps";
import { useChangeDetector, useLazyMemo } from "@eavfw/hooks";
import { useModelDrivenApp } from "../../../../useModelDrivenApp";
import { AutoFormColumnsDefinition, AutoFormControlsDefinition, BaseNestedType, deleteRecordSWR, EntityDefinition, FormColumnDefinition, FormDefinition, FormTabDefinition, FormTabDefinitionWithColumns, getRecordSWR, hasColumns, hasControl, hasFields, hasForm, hasHtml, hasJsonSchema, queryEntitySWR, ViewReference } from "@eavfw/manifest";
import { ControlJsonSchemaObject } from "../ControlJsonSchema";
import { capitalize } from "@eavfw/utils";
import { useUserProfile } from "../../../Profile/useUserProfile";
import { filterRoles } from "../../../../filterRoles";
import { getDependencySchema } from "./getDependencySchema";
import { getJsonSchema } from "./getJsonSchema";
import { useAppInfo } from "../../../../useAppInfo";
import { ICommandBarItemProps, Panel, Stack } from "@fluentui/react";
import { FormRender } from "../../FormRender";
import ControlsComponent, { BaseInputTemplate, WidgetRegister } from "../ControlsComponent";
import { RibbonContextProvider } from "../../../Ribbon/RibbonContextProvider";
import ModelDrivenGridViewer from "../../../Views/ModelDrivenGridViewer";
import { Views } from "../../../Views/ViewRegister";
import ColumnComponent from "../ColumnComponent";
import { Controls } from "../../../Controls/ControlRegister";
import { useEAVForm } from "../../../../../../forms/src";
import { RibbonHost } from "../../../Ribbon/RibbonHost";
import { PagingProvider } from "../../../Views/PagingContext";
import { useStackStyles } from "../../../useStackStyles";
import { ControlsComponentSlim } from "../ControlsComponentSlim";
import { FormHostContext, ModelDrivenForm, useEvaluateFormDefinition } from "../../ModelDrivenEntityViewer";
import { ModelDrivenApp } from "../../../../ModelDrivenApp";
import { Form } from "@rjsf/fluent-ui";
import FieldTemplate from "../Templates/FieldTemplate";
import validator from '@rjsf/validator-ajv8';



function trimId(str: string) {
    if (str.toLowerCase().endsWith("id"))
        return str.slice(0, -2);
    return str;
}
function padId(str: string) {
    if (!str.toLowerCase().endsWith("id"))
        return `${str}id`;
    return str;
}








function throwError(err: Error) {
    throw err;
}

function findEntry(columns: Required<AutoFormColumnsDefinition>["columns"], columnName: string, sectionName: string) {

    if (columnName in columns) {
        let sections = columns[columnName].sections;
        if (sectionName in sections) {
            return sections[sectionName];
        }
    }

}

const useSchema = (entityName: string, entity: EntityDefinition, columns: any, tabName: string, columnName: string, sectionName: string, app: ModelDrivenApp, formName: string, formContext: any) => {


    const [schema, setSchema] = useState<ControlJsonSchemaObject>();


    const lastSchema = useRef<ControlJsonSchemaObject>();

    const user = useUserProfile();
    //const _entity = entity;
    useEffect(() => {

        //   const entity = app.getEntity(entityName);
        console.log("Recalculating Schema:", [entityName, entity, Object.keys(columns).join(", ")]);
        const fields = Object.keys(columns)
            .filter(
                (field) =>
                    columns[field].tab === tabName &&
                    columns[field].column === columnName &&
                    columns[field].section === sectionName
            )
            .filter(field => (!columns[field]?.roles) || filterRoles(columns[field]?.roles, user))
            .map((field) => ({
                key: field,
                attributeName: field,
                fieldName: field,
                attribute: entity.attributes[field] ?? (entity.TPT && app.getEntity(entity.TPT)?.attributes[field]), //?? throwError(new Error(`The attribute for ${field} was not defined on ${entity.schemaName}`)),
                field: columns[field]
            }));



        const deps = fields.filter(f => f.field.dependant).map(f => f.field.dependant).filter((v, i, a) => a.indexOf(v) === i);
        console.log(deps);
        if (fields.length > 0) {
            const schemaDef: ControlJsonSchemaObject = {
                type: "object",
                dependencies: Object.fromEntries(deps.map(field =>
                    [entity.attributes[field!].logicalName, getDependencySchema(fields, field, entity, app, formName, formContext)])),
                required: fields.filter(f => (f.attribute?.type as BaseNestedType)?.required).map(field => field.attribute.logicalName),
                properties: Object.assign(
                    {},
                    ...fields.filter(f => !f.field.dependant)
                        .map((field) => ({
                            [field.attribute?.logicalName ?? field.key]: getJsonSchema(field.attribute, field.field, entity, app.locale, {
                                entityName: entity.logicalName,
                                fieldName: field.fieldName,
                                attributeName: field.attributeName,
                                formName: formName,
                                ...formContext
                            }),
                        }))
                ),
            };

            console.log("schemadetect", [JSON.parse(JSON.stringify(lastSchema.current ?? {})), JSON.parse(JSON.stringify(schemaDef)), isEqual(lastSchema.current, schemaDef)]);
            if (!isEqual(lastSchema.current, schemaDef)) {
                lastSchema.current = schemaDef;
                setSchema(schemaDef);
            }
        }
    }, [columns]);

    return schema;
}

export function SectionComponent<T extends { id?: string, [key: string]: any }>(
    props: SectionComponentProps<T>
) {
    const {
        form,
        tabName,
        columnName,
        sectionName,
        entityName,
        entity,
        formName,
        formData,
        onFormDataChange,
        factory,
        locale,
        formContext,
        extraErrors
    } = props;

    try {
        console.group("SectionComponent: Section: " + sectionName);

        const renderId = useRef(new Date().toISOString());
        renderId.current = new Date().toISOString();
        useChangeDetector(`SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} form`, form, renderId);
        useChangeDetector(`SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} tabName`, tabName, renderId);
        useChangeDetector(`SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} columnName`, columnName, renderId);
        useChangeDetector(`SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} sectionName`, sectionName, renderId);
        useChangeDetector(`SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} entity`, entity, renderId);
        useChangeDetector(`SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} formName`, formName, renderId);
        useChangeDetector(`SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} formData`, formData, renderId);
        useChangeDetector(`SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} onFormDataChange`, onFormDataChange, renderId);
        useChangeDetector(`SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} factory`, factory, renderId);
        useChangeDetector(`SectionComponent: Tab: ${tabName} Column: ${columnName} Section: ${sectionName} locale`, locale, renderId);

        const columns = form.columns;
        const tab = form.layout.tabs[tabName] as FormTabDefinitionWithColumns;
        const section = findEntry(tab.columns, columnName, sectionName);

        if (hasColumns(section)) {
            const columns = section.columns;
            const ui = (
                <Stack verticalFill horizontal gap={25} styles={{
                    root: {
                        display: "grid",
                        gridTemplateColumns: `${Object.keys(columns).map(c => '1fr').join(' ')};`
                    }
                }}>
                    {Object.keys(columns).map((columnName, idx) => (
                        <Stack.Item grow className={columnName} key={columnName}>
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


        } else if (hasControl(section)) {
            if (section.control in Controls) {
                const CustomControl = Controls[section.control];

                return <Stack verticalFill gap={25} styles={{

                }}><Stack.Item grow>
                        <CustomControl />
                    </Stack.Item>
                </Stack>
            }

        }

        const app = useModelDrivenApp();
        const router = useRouter();
        const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);

        const localization = {
            new: capitalize(app.getLocalization("new") ?? "New"),
            delete: "Delete",
        };

        const schema = useSchema(entityName, entity, columns, tabName, columnName, sectionName, app, formName, formContext);


        //TODO , make expression parsning work on views.
        const [{ allowedforchildcreation }] = useEAVForm((state) => ({ "allowedforchildcreation": state.formValues.allowedforchildcreation }));
        const appinfo = useAppInfo();

        const views = useLazyMemo(() => {
            console.groupCollapsed("Setting Related Views: " + entity.logicalName);
            try {
                const views = app
                    .getReferences(
                        entity.logicalName,
                        formName,
                        tabName,
                        columnName,
                        sectionName
                    );

                console.log("Setting Views", JSON.stringify(views), allowedforchildcreation, appinfo.currentEntityName, appinfo.currentRecordId);
                for (let view of views) {
                    view.ribbon = Object.assign({}, view?.ribbon ?? {});
                    let visible = view.ribbon.new?.visible as string | boolean;
                    if (typeof (visible) === "string" && visible.indexOf('@') !== -1) {
                        if (visible === "@canCreateTaskDefintion()") {
                            view.ribbon.new.visible = allowedforchildcreation ?? false;
                        }
                    }
                }
                console.log("Setting Views", JSON.stringify(views), allowedforchildcreation, appinfo.currentEntityName, appinfo.currentRecordId);
                return views;
            } finally {
                console.groupEnd();
            }
        }, [entity.logicalName, formName, tabName, columnName, sectionName, allowedforchildcreation, appinfo.currentEntityName, appinfo.currentRecordId]);



        const [activeViewRef, setactiveViewRef] = useState<ViewReference>();
        useEffect(() => {
            if (activeViewRef) {
                openPanel();
            } else {
                dismissPanel();
            }
        }, [activeViewRef]);

        const { currentAppName, currentAreaName } = useAppInfo();

        return (
            <>
                <Panel
                    headerText="Quick Create" styles={{ scrollableContent: { display: 'flex', flexDirection: 'column', flexGrow: 1 } }}
                    isOpen={isOpen}
                    onDismiss={() => setactiveViewRef(undefined)}
                    // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
                    closeButtonAriaLabel="Close"
                >
                    <Stack verticalFill>
                        {activeViewRef && <FormRender stickyFooter={false} dismissPanel={(ev) => { setactiveViewRef(undefined); }} record={{}}
                            onChange={(data) => {
                                console.log(data);
                                onFormDataChange?.({ [activeViewRef!.entity.collectionSchemaName.toLowerCase()]: [...formData[activeViewRef.entity.collectionSchemaName.toLowerCase()] ?? [], data] } as any);
                            }} formName="Quick"
                            entityName={activeViewRef!.entityName} />
                        }

                    </Stack>


                </Panel>

                {schema && <ControlsComponent<T> entityName={entityName}
                    factory={factory}
                    locale={locale}
                    formData={formData}
                    sectionName={sectionName}
                    tabName={tabName}
                    columnName={columnName}
                    onFormDataChange={onFormDataChange}
                    schema={schema}
                    formContext={formContext}
                    extraErrors={extraErrors}
                />}
                {views
                    .map((gridprops) => (

                        <RibbonContextProvider key={gridprops.key}>
                            <RibbonHost ribbon={gridprops.ribbon ?? {}}>
                                <PagingProvider initialPageSize={typeof (gridprops.view?.paging) === "object" ? gridprops.view.paging.pageSize ?? undefined : undefined} enabled={!(gridprops.view?.paging === false || (typeof (gridprops.view?.paging) === "object" && gridprops.view?.paging?.enabled === false))} >
                                    <ModelDrivenGridViewer
                                        {...gridprops}
                                        locale={locale}
                                        onChange={onFormDataChange}
                                        filter={`$filter=${gridprops.attributeType === 'lookup' || gridprops.inlinePolyLookup ? gridprops.attribute : `${trimId(gridprops.attribute)}/${padId(entityName)}`} eq ${formData.id}` + (gridprops.filter ? ' and ' + gridprops.filter : '')}
                                        formData={formData}
                                        newRecord={formData.id ? false : true}
                                        defaultValues={formData[gridprops.entity.collectionSchemaName.toLowerCase()]}
                                        listComponent={gridprops.view?.control && gridprops.view?.control in Views ? Views[gridprops.view.control] : undefined}
                                        padding={0}
                                        showRibbonBar={true}
                                        showViewSelector={false}
                                        recordRouteGenerator={(record) =>
                                            app.recordUrl({
                                                appName: currentAppName,
                                                areaName: currentAreaName,
                                                entityName: '$type' in record ? record['$type'] :
                                                    record.entityName ?? entity.logicalName,
                                                recordId: record.id,
                                            })
                                        }
                                        commands={(view) => [
                                            {
                                                key: "newRelatedItem",
                                                text: `${localization.new} ${gridprops.entity.locale?.[
                                                    app.locale
                                                ]?.displayName ??
                                                    gridprops.entity.displayName
                                                    }`,
                                                iconProps: { iconName: "Add" },
                                                onClick: (e, i) => {

                                                    console.log([e, view, gridprops]);

                                                    if (gridprops.view?.ribbon?.new?.supportQuickCreate) {

                                                        setactiveViewRef(gridprops);
                                                    } else {

                                                        router.push(app.newEntityUrl(
                                                            router.query.appname as string,
                                                            router.query.area as string,
                                                            gridprops.entity.logicalName,
                                                            undefined,
                                                            {
                                                                [gridprops.attribute]:
                                                                    formData?.id,
                                                            }
                                                        ));
                                                    }
                                                    //location.href = ;
                                                },
                                            } as ICommandBarItemProps,
                                            {
                                                key: "deleteSelection",
                                                text: `${localization.delete}`,
                                                iconProps: { iconName: "Delete" },
                                                disabled: view.selection.getSelection().length === 0,
                                                onClick: (e, i) => {
                                                    setTimeout(async () => {
                                                        let tasks = view.selection.getSelection().map(i => deleteRecordSWR(gridprops.entity, i.id!));
                                                        await Promise.all(tasks);

                                                        location.reload();
                                                    });
                                                },
                                            } as ICommandBarItemProps//,
                                        ].filter((commandBarButton) => (commandBarButton.key === "newRelatedItem" && gridprops?.ribbon?.new?.visible !== false) || (commandBarButton.key === "deleteSelection" && gridprops?.ribbon?.delete?.visible !== false))}
                                    />
                                </PagingProvider>
                            </RibbonHost>
                        </RibbonContextProvider>
                    ))}
            </>
        );
    } finally {
        console.groupEnd();
    }
}

export default SectionComponent;


export const SectionComponentSlim: React.FC<{
    section: AutoFormColumnsDefinition | AutoFormControlsDefinition,
    title?: string
}> = ({ section }) => {

    const styles = useStackStyles();
    console.log("SectionComponentSlim", [section]);
    if (hasColumns(section)) {
        const columns = section.columns;
        const ui = (
            <Stack verticalFill horizontal gap={25} styles={{
                root: {
                    display: "grid",
                    gridTemplateColumns: `${Object.keys(columns).map(c => '1fr').join(' ')};`
                }
            }}>
                {Object.keys(columns).map((columnName, idx) => (
                    <Stack.Item grow className={columnName} key={columnName}>
                        <ControlsComponentSlim />
                    </Stack.Item>
                ))}
            </Stack>
        );
        return ui;


    } else if (hasControl(section)) {
        if (section.control in Controls) {
            const CustomControl = Controls[section.control];

            return <Stack verticalFill gap={25} styles={{

            }}><Stack.Item grow>
                    <CustomControl />
                </Stack.Item>
            </Stack>
        }

    } else if (hasHtml(section)) {
        return <div dangerouslySetInnerHTML={{ __html: section.html }}></div>
    } else if (hasForm(section)) {
        const app = useModelDrivenApp();
        const { currentEntityName } = useAppInfo();
        const forminfo = typeof section.form === "string" ? { entity: currentEntityName, form: section.form } : section.form;
        const entity = app.getEntity(forminfo.entity);

        return <ModelDrivenForm entity={entity} entityName={forminfo.entity} form={entity.forms![forminfo.form]} locale={app.locale} formName={forminfo.form} />



    } else if (hasFields(section)) {
        const app = useModelDrivenApp();
        const { currentEntityName } = useAppInfo();
        const [formData, { onChange }] = useEAVForm(x => x.formValues);
        const columns = useMemo(() => Object.fromEntries(Object.entries(section.fields).map(([x, v]) => [x, { ...v, tab: "TAB_General", column: "COLUMN_First", section: "SECTION_General" }])), [section.fields]);
        console.log("Rendering Fields", [columns]);

        const form = useMemo(() => ({
            "type": "QuickCreate",
            "name": "WizardDynamic",
            "layout": {
                "tabs": {
                    "TAB_General": {
                        "title": "General Information",
                        "locale": {
                            "1030": {
                                "title": "General Information"
                            }
                        },
                        "columns": {
                            "COLUMN_First": {
                                "sections": {
                                    "SECTION_General": {}
                                }
                            }

                        }
                    },
                }
            },
            "columns": columns
        } as FormDefinition), []);
        const { evaluatedForm, isLoadingForm } = useEvaluateFormDefinition(form, formData, "WizardDynamic", currentEntityName);
        const formHostContextValue = useMemo(() => ({ formDefinition: evaluatedForm }), [evaluatedForm]);
        const schema = useSchema(currentEntityName, app.getEntity(currentEntityName), columns, "TAB_General", "COLUMN_First", "SECTION_General", app, "WizardDynamic", {});

        if (!schema)
            return null;
        console.log("Rendering Fields", [columns, schema]);
        return (
            <FormHostContext.Provider value={formHostContextValue}>
                <ControlsComponent entityName={currentEntityName}
                    factory={undefined}
                    locale={app.locale}
                    formData={formData}



                    onFormDataChange={onChange}
                    schema={schema}
                    formContext={{}}

                />
            </FormHostContext.Provider>)

    } else if (hasJsonSchema(section)) {
        const [formData, { onChange }] = useEAVForm(x => x.formValues);
        console.log("UIPROPS", [section.uiSchema, section.schema]);
        return (
            <Form
                uiSchema={section.uiSchema}
                schema={section.schema }
                onChange={(e) => {

                    onChange((props, ctx) => {
                        props[section.logicalName] = e.formData;
                    })
                }}
               
                idPrefix={'wizard'}
                formData={formData[section.logicalName]}
              //  widgets={WidgetRegister} 

                templates={{ BaseInputTemplate: BaseInputTemplate } }
              //  templates={{ FieldTemplate: FieldTemplate }}
                showErrorList={false}
                validator={validator}

            ><Fragment /></Form>
            )
    }
    return <ControlsComponentSlim />
    }

