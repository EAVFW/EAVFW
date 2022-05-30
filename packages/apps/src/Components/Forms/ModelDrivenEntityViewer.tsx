import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IDropdownOption, IPivotProps, Stack, Sticky, StickyPositionType } from "@fluentui/react";
 
import isEqual from "react-fast-compare";

import { useAsyncMemo, useDebouncer } from "@eavfw/hooks";
import { AttributeDefinition, EntityDefinition, FormDefinition, FormColumnDefinition, FormTabDefinition, isLookup, queryEntitySWR, IRecord } from "@eavfw/manifest";

import { EAVForm } from "@eavfw/forms"
import { FormValidation } from "@rjsf/core";
import { FormsConfig } from "../../FormsConfig";
import { OptionsFactory } from "./AutoForm/OptionsFactory";
import { ModelDrivenApp } from "../../ModelDrivenApp";
import { ModelDrivenEntityViewerProps } from "./ModelDrivenEntityViewerProps";
import { useModelDrivenApp } from "../../useModelDrivenApp";
import { useRibbon } from "../Ribbon/useRibbon";
import { ResolveFeature } from "../../FeatureFlags";
import { RibbonHost } from "../Ribbon/RibbonHost";
import { FormSelectorComponent } from "./FormSelectorComponent";
import FormComponent from "./AutoForm/FormComponent";



const FormHostContext = createContext({ formDefinition: {} as FormDefinition });
export const useFormHost = () => useContext(FormHostContext);


const groupBy = function <T extends { [key: string]: any }>(xs: Array<T>, key: (a: T) => string) {
    return xs.reduce(function (rv, x) {
        (rv[key(x)] = rv[key(x)] || []).push(x);
        return rv;
    }, {} as { [key: string]: Array<T> });
};

function getForm(app: ModelDrivenApp, entity: EntityDefinition, formName: string) {
    const form: FormDefinition = entity?.forms?.[formName] ??
    {
        "name": "Main Information",
        "type": "Main",
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
                        },
                        "COLUMN_Second": {
                            "sections": {
                                "SECTION_Additional": {}
                            }
                        }
                    }
                },
            }
        },
        "columns": Object.fromEntries(
            Object.entries(app.getAttributes(entity.logicalName))
                .filter(([k, entry]) => k.toLowerCase() !== "id")
                .map(([k, entry]) => [k, {
                    "tab": "TAB_General",
                    "column": "COLUMN_First",
                    "section": "SECTION_General"
                }])
        )
    };

    if (form === undefined) {
        console.error("No form available on entity:", entity);
        throw new Error("No form available");
    }
    return form;
}

function createRadioGroups(form: FormDefinition, entity: EntityDefinition) {
    let radioGroups = groupBy(Object.keys(form.columns)
        .filter(k => form.columns[k].radio_group)
        .map(k => [k, form.columns[k], entity.attributes[k]] as [string, FormColumnDefinition, AttributeDefinition]), (x) => x[1].radio_group!);
    return Object.values(radioGroups);
}

/**
  * Load the evaludated form and only forward it when its actually updated.
  * */
function useEvaluateFormDefinition(form: FormDefinition, formDataRefcurrent:any) {
  
    const useEvaluateFormDefinition = ResolveFeature("useEvaluateFormDefinition");
    const { evaluatedForm: evaluatedFormDelayed, isEvaluatedFormLoading } = useEvaluateFormDefinition(form, formDataRefcurrent);
    const [evaluatedForm, setevaluatedForm] = useState(evaluatedFormDelayed);

    useEffect(() => {
        console.log("useEvaluateFormDefinition: ", [evaluatedForm, isEvaluatedFormLoading]);
        if (!isEvaluatedFormLoading && evaluatedFormDelayed !== evaluatedForm) {
            console.log("useEvaluateFormDefinition: setting new form definition", [evaluatedForm, isEvaluatedFormLoading]);
            setevaluatedForm(evaluatedFormDelayed);
        }
    }, [evaluatedForm,evaluatedFormDelayed, isEvaluatedFormLoading])

    return evaluatedForm;
    //-
}

type ModelDrivenForm = ModelDrivenEntityViewerProps & {
    setForm: any,
    form: FormDefinition,
    formDataRef: any,
    onFormDataChange: any
}
const ModelDrivenForm: React.FC<ModelDrivenForm> = ({
    entity,
    formName,
    locale,
    entityName,
    record,
    factory,
    extraErrors,
    setForm,
    form,
    formDataRef, onFormDataChange
}: ModelDrivenForm) => {


    const app = useModelDrivenApp();

    const [selectedForm, setselectedForm] = useState(formName ?? Object.keys(entity.forms ?? {})[0]);
    

    const firstFormUpdate = useRef(true);
    useEffect(() => {
        if (firstFormUpdate.current) {
            firstFormUpdate.current = false;
            return;
        }
        setForm(getForm(app, entity, formName));
    }, [entity, formName]);

    const firstRecordUpdate = useRef(true);
    useEffect(() => {
        if (firstRecordUpdate.current) {
            firstRecordUpdate.current = false;
            return;
        }
        console.log("Record is updated");
        console.log(record);
    }, [record]);


  

    const evaluatedForm = useEvaluateFormDefinition(form, formDataRef.current);
    const formHostContextValue = useMemo(() => ({ formDefinition: evaluatedForm }), [evaluatedForm]);
    

    const getTabName = useCallback((tab: FormTabDefinition) => {
        console.log(tab);
        return tab.locale?.[locale]?.title ?? tab.title;
    }, [locale]);

    const _onChangeForm = useCallback((
        event: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption,
        index?: number
    ) => {
        setselectedForm(option?.key as string);
    }, []);



    // const _onChange = useDebouncer(onChange!, 50);

    //Issue if multiople onFormDataChange called, then only latest is applied.  Need to merge state of the debouncer and
   


    

   


    useEffect(() => {
        console.log("FormData Updated", record);
    }, [record])

    const [tabs, setTabs] = useState(Object.keys(evaluatedForm?.layout.tabs ?? {}));



    const { data: { items: descriptions } = { items: [] }, isLoading } =
        process.env['NEXT_PUBLIC_DESCRIPTION_ENTITY'] ?
            queryEntitySWR(app.getEntity(process.env['NEXT_PUBLIC_DESCRIPTION_ENTITY'] as string), { '$filter': `entity eq '${entityName}' ` })
            : (console.log("NO NEXT_PUBLIC_DESCRIPTION_ENTITY: " + process.env['NEXT_PUBLIC_DESCRIPTION_ENTITY']) as any || { data: { items: [] as IRecord[] }, isLoading: false })


    console.log(descriptions);


    const first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        const newTabs = Object.keys(evaluatedForm?.layout.tabs ?? {});
        if (newTabs.length !== tabs.length || tabs.some((value, index) => newTabs[index] !== value)) {
            setTabs(newTabs);
        }
    }, [evaluatedForm]);

    if (!evaluatedForm || !tabs.length || isLoading) {
        return <div>loading form...</div>
    }
    const forms = entity?.forms ?? {};

    const hasMoreForms = Object.keys(forms).filter(f => forms[f].type === "Main").length > 1;

    const primaryField = Object.values(app.getAttributes(entityName)).find((a) => a.isPrimaryField)!;

 

    
    return <RibbonHost ribbon={evaluatedForm?.ribbon ?? form.ribbon ?? {}}>
        <FormHostContext.Provider value={formHostContextValue}>
           
         <Stack verticalFill>

        {evaluatedForm?.type !== "QuickCreate" && <Stack.Item styles={{ root: { marginLeft: 15, paddingTop: 8 } }}>
            <h2>{formDataRef.current[primaryField?.logicalName]}</h2>
            <Stack horizontal style={{ alignItems: "center" }}>
                <h3 style={{ height: "28px" }}>{entity.locale?.[locale]?.displayName ?? entity.displayName}</h3>
                {hasMoreForms && (
                    <FormSelectorComponent
                        onChangeView={_onChangeForm}
                        selectedForm={selectedForm}
                        entity={entity}
                        styles={{ root: { padding: 0 } }}
                    />
                )}
            </Stack>
        </Stack.Item>
        }

        <Stack.Item grow styles={{ root: { padding: 0 } }}>
            <FormComponent {... { tabs, getTabName, entity, formName, onFormDataChange, locale, factory, extraErrors }}
                form={evaluatedForm}
                formData={formDataRef.current}
                formContext={{ descriptions: descriptions, locale: locale, isCreate: record.id ? false : true, formData: formDataRef.current, onFormDataChange: onFormDataChange }}

            />
        </Stack.Item>
            </Stack>     </FormHostContext.Provider>
     </RibbonHost>
}

export const ModelDrivenEntityViewer: React.FC<ModelDrivenEntityViewerProps> = (props) => {


    const app = useModelDrivenApp();

    const { record, entity, formName, onChange, related } = props;

    const [form, setForm] = useState<FormDefinition>(getForm(app, entity, formName));

    const formdatamerger = useRef({});

    const formDataRef = useRef(record);
    const [etag, setEtag] = useState(new Date().toISOString());

    /**
     * When the outher recrod is updated, trigger a etag changed that dependent parts can monitor
     **/
    useEffect(() => {
        formDataRef.current = record;
        setEtag(new Date().toISOString());
    }, [record]);

    const [groups] = useState(createRadioGroups(form, entity));


    const onFormDataChange2 = useCallback((formdata: any) => {
        try {
            formdatamerger.current = {};
            console.groupCollapsed("onFormDataChange", [formDataRef.current, formdata]);
            let oldFormData = Object.assign({}, formDataRef.current);
            let changed = false;

            let attributes = [...Object.keys(entity.attributes), ...(Object.keys((entity.TPT && app.getEntity(entity.TPT).attributes) ?? {}))];

            while (attributes.length > 0) {
                let attributeKey = attributes.shift()!;
                console.debug("partOfGroup", attributeKey);
                let attribute = entity.attributes[attributeKey] ?? app.getEntity(entity.TPT!).attributes[attributeKey];

                if (attribute.logicalName in formdata || (isLookup(attribute.type) && attribute.logicalName.slice(0, -2) in formdata)) {
                    console.log(`Found ${attribute.logicalName} in formdata`);


                    if (oldFormData[attribute.logicalName] !== formdata[attribute.logicalName]) {

                        console.log(`Found ${attribute.logicalName} in formdata that changed from '${oldFormData[attribute.logicalName]}' to '${formdata[attribute.logicalName]}'`);

                        oldFormData[attribute.logicalName] = formdata[attribute.logicalName];
                        if (formdata[attribute.logicalName] === undefined)
                            delete oldFormData[attribute.logicalName];
                        changed = true;

                        let partOfGroup = groups.filter(g => g.filter(gg => gg[2].logicalName === attribute.logicalName).length > 0)[0];

                        if (partOfGroup && oldFormData[attribute.logicalName]) {

                            console.log(`Found ${attribute.logicalName} in formdata that is part of group`);

                            for (let others of partOfGroup.filter(g => g[2].logicalName !== attribute.logicalName)) {
                                console.log(`Changing ${others[2].logicalName} in formdata to false and removing from attributes`);
                                oldFormData[others[2].logicalName] = false;
                                console.log(attributes);
                                attributes.splice(attributes.indexOf(others[0]), 1);
                                console.log(attributes);
                            }
                        }

                        if (!formdata[attribute.logicalName]) {

                            let dependants = Object.keys(form.columns).filter(k => form.columns[k].dependant === attributeKey);
                            console.log("found deps: ", dependants);
                            for (let dependant of dependants) {
                                formdata[entity.attributes[dependant].logicalName] = undefined;
                            }
                            attributes.push(...dependants.filter(d => attributes.indexOf(d) === -1));
                            console.log("updated attributes ", attributes);
                        }
                    } else {

                        const lookupValue = typeof formdata[attribute.logicalName] == "object" ? formdata[attribute.logicalName] : formdata[attribute.logicalName.slice(0, -2)];

                        if (isLookup(attribute.type) && lookupValue) {



                            const oldvalue = oldFormData[attribute.logicalName.slice(0, -2)];
                            console.log(`Found ${attribute.logicalName} in formdata as lookup object`,
                                oldFormData[attribute.logicalName.slice(0, -2)], lookupValue);

                            if (lookupValue.id) {
                                oldFormData[attribute.logicalName] = lookupValue.id;
                            } else {
                                // Remove ID from old object
                                delete oldFormData[attribute.logicalName]
                            }
                            //  const keys = Object.keys(formdata[attribute.logicalName]);
                            if (!isEqual(oldvalue, lookupValue)) {
                                changed = true;
                                console.log(`Found ${attribute.logicalName.slice(0, -2)} in formdata as lookup object that was changed`);

                            }
                            oldFormData[attribute.logicalName.slice(0, -2)] = lookupValue;



                        }
                    }
                }
            }
            console.log(related);
            for (let relate of related ?? []) {
                console.log([formdata[relate], oldFormData[relate], isEqual(oldFormData[relate], formdata[relate])]);
                if (!isEqual(oldFormData[relate] ?? [], formdata[relate] ?? [])) {
                    oldFormData[relate] = formdata[relate];
                    changed = true;
                }

                if (!isEqual(oldFormData[relate + "@deleted"] ?? [], formdata[relate + "@deleted"] ?? [])) {
                    oldFormData[relate + "@deleted"] = formdata[relate + "@deleted"];
                    changed = true;
                }
            }

            console.log(oldFormData);
            console.log(formDataRef.current);
            console.log(changed);

            if (changed) {
                formDataRef.current = oldFormData;
                onChange?.(oldFormData);
                setEtag(new Date().toISOString());
            }

        } finally {
            console.groupEnd();
        }
    }, [record, entity]);

    const onFormDataChange = useCallback((formdata: any) => {

        console.log("FormData Changing", { changes: formdata, old: formdatamerger.current });

        formdatamerger.current = { ...formdatamerger.current, ...formdata };

        console.log("FormData Changed", { changes: formdata, new: formdatamerger.current });

        return onFormDataChange2(formdatamerger.current);
    }, [onFormDataChange2]);

    return (
        <EAVForm defaultData={formDataRef.current} onChange={onFormDataChange}>


            <ModelDrivenForm  {...props} onFormDataChange={onFormDataChange} formDataRef={formDataRef} setForm={setForm} form={form} />
           

        </EAVForm>
    );
}

export default ModelDrivenEntityViewer
