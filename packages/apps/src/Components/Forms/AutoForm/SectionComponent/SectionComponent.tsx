import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";



import isEqual from "react-fast-compare";


import { useBoolean } from "@fluentui/react-hooks";
import { SectionComponentProps } from "./SectionComponentProps";
import { useChangeDetector, useLazyMemo } from "@eavfw/hooks";
import { useModelDrivenApp } from "../../../../useModelDrivenApp";
import { AutoFormColumnsDefinition, AutoFormControlsDefinition, BaseNestedType, deleteRecordSWR, FormTabDefinition, FormTabDefinitionWithColumns, getRecordSWR, hasColumns, hasControl, queryEntitySWR, ViewReference } from "@eavfw/manifest";
import { ControlJsonSchemaObject } from "../ControlJsonSchema";
import { capitalize } from "@eavfw/utils";
import { useUserProfile } from "../../../Profile/useUserProfile";
import { filterRoles } from "../../../../filterRoles";
import { getDependencySchema } from "./getDependencySchema";
import { getJsonSchema } from "./getJsonSchema";
import { useAppInfo } from "../../../../useAppInfo";
import { ICommandBarItemProps, Panel, Stack } from "@fluentui/react";
import { FormRender } from "../../FormRender";
import ControlsComponent from "../ControlsComponent";
import { RibbonContextProvider } from "../../../Ribbon/RibbonContextProvider";
import ModelDrivenGridViewer from "../../../Views/ModelDrivenGridViewer";
import { Views } from "../../../Views/ViewRegister";
import ColumnComponent from "../ColumnComponent";
import { Controls } from "../../../Controls/ControlRegister";
import { useEAVForm } from "../../../../../../forms/src";
import { RibbonHost } from "../../../Ribbon/RibbonHost";
import { PagingProvider } from "../../../Views/PagingContext";











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

                return <Stack verticalFill  gap={25} styles={{
                     
                }}><Stack.Item grow>
                        <CustomControl />
                    </Stack.Item>
                </Stack>
            }

        }

        const app = useModelDrivenApp();
        const router = useRouter();
        const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);
      //  const [views, setViews] = useState<Array<ViewReference>>([]);
        const [schema, setSchema] = useState<ControlJsonSchemaObject>();
        const localization = {
            new: capitalize(app.getLocalization("new") ?? "New"),
            delete: "Delete",
        };

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

        //TODO , make expression parsning work on views.
        const [{ allowedforchildcreation }] = useEAVForm((state) => ({ "allowedforchildcreation": state.formValues.allowedforchildcreation }));
        const appinfo = useAppInfo();
        
        const views = useLazyMemo(() => {
            console.groupCollapsed("Setting Related Views");
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
                            <RibbonHost ribbon={entity.views?.[gridprops.viewName!]?.ribbon ?? {}}>
                                <PagingProvider>
                            <ModelDrivenGridViewer
                                {...gridprops}
                                locale={locale}
                                onChange={onFormDataChange}
                                filter={`$filter=${gridprops.attribute} eq ${formData.id}` + (gridprops.filter ? ' and ' + gridprops.filter :'')}
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
                                        entityName:
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
