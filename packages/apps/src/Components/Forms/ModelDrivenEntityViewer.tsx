import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IDropdownOption, mergeStyles, ShimmerElementsGroup, ShimmerElementType, Stack } from "@fluentui/react";

import isEqual from "react-fast-compare";

import { useUuid } from "@eavfw/hooks";
import { AttributeDefinition, EntityDefinition, FormDefinition, FormColumnDefinition, FormTabDefinition, isLookup, queryEntitySWR, IRecord } from "@eavfw/manifest";

import { EAVForm, useEAVForm } from "@eavfw/forms"
import { ModelDrivenApp } from "../../ModelDrivenApp";
import { ModelDrivenEntityViewerProps } from "./ModelDrivenEntityViewerProps";
import { useModelDrivenApp } from "../../useModelDrivenApp";
import { ResolveFeature } from "../../FeatureFlags";
import { RibbonHost } from "../Ribbon/RibbonHost";
import { FormSelectorComponent } from "./FormSelectorComponent";
import FormComponent from "./AutoForm/FormComponent";
import { useAppInfo } from "../../useAppInfo";
import { useFormChangeHandlerProvider } from "./useFormChangeHandler";
import { useRibbon } from "../../Components/Ribbon";



const FormHostContext = createContext({ formDefinition: {} as FormDefinition });
export const useFormHost = () => useContext(FormHostContext);

const wrapperClass = mergeStyles({
    padding: 2,
    selectors: {
        '& > .ms-Shimmer-container': {
            margin: '10px 0',
        },
    },
});
const wrapperStyle = { display: 'flex' };

const groupBy = function <T extends { [key: string]: any }>(xs: Array<T>, key: (a: T) => string) {
    return xs.reduce(function (rv, x) {
        (rv[key(x)] = rv[key(x)] || []).push(x);
        return rv;
    }, {} as { [key: string]: Array<T> });
};

function getForm(app: ModelDrivenApp, entityName: string, formName: string) {

    console.log("Resolving Form for :", [entityName, formName]);
    const entity = app.getEntity(entityName);
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

    console.log("Resolving Form for :", [entityName, formName, Object.keys(form.columns).join(", ")]);

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
function useEvaluateFormDefinition(form: FormDefinition, formDataRefcurrent: any, formName: string, entityName: string) {

    const useEvaluateFormDefinition = ResolveFeature("useEvaluateFormDefinition");
    const { evaluatedForm: evaluatedFormDelayed, isEvaluatedFormLoading } = useEvaluateFormDefinition(form, formDataRefcurrent);
    const [evaluatedForm, setevaluatedForm] = useState(evaluatedFormDelayed);
    const [isLoadingForm, setisLoadingForm] = useState(true);

    // const key = useMemo(() => `${formName}${entityName}`, [formName, entityName])

    const [oldKey, setOldKey] = useState(`${formName}${entityName}`);



    //useEffect(() => {
    //    setOldKey(`${formName}${entityName}`);
    //}, [formName, entityName]);

    //useEffect(() => {

    //    if (oldKey !== `${formName}${entityName}`) {
    //        setisLoadingForm(true);
    //    }
    //}, [formName, entityName, oldKey]);


    //useEffect(() => {
    //    setisLoadingForm(true);
    //}, [formName, entityName]);

    useEffect(() => {
        console.log("useEvaluateFormDefinition: ", [entityName, formName, evaluatedForm, isEvaluatedFormLoading]);
        if (!isEvaluatedFormLoading && evaluatedFormDelayed !== evaluatedForm) {
            console.log("useEvaluateFormDefinition: setting new form definition", [evaluatedForm, isEvaluatedFormLoading]);
            setevaluatedForm(evaluatedFormDelayed);
            setisLoadingForm(false);
        }
    }, [evaluatedForm, evaluatedFormDelayed, isEvaluatedFormLoading]);



    //useEffect(() => {
    //    setisLoadingForm(false);
    //}, [evaluatedForm]);


    //let current= useMemo(() => {

    //    return { evaluatedForm, isLoadingForm: false, formName, entityName };
    //}, [evaluatedForm,])

    //return current;
    return { evaluatedForm, isLoadingForm: false };

    //-
}

type ModelDrivenFormProps = ModelDrivenEntityViewerProps & {
    form: FormDefinition,
    //   formDataRef: any,
    //  onFormDataChange: any
}
const ModelDrivenForm: React.FC<ModelDrivenFormProps> = ({
    entity,
    formName,
    locale,
    entityName,
    //   record,
    factory,
    extraErrors,
    form,
    //formDataRef,
    //  onFormDataChange
}) => {

    const compID = useUuid();
    console.log("ModelDrivenForm: ID", [compID]);
    const app = useModelDrivenApp();

    const [selectedForm, setselectedForm] = useState(formName ?? Object.keys(entity.forms ?? {})[0]);


    //const firstRecordUpdate = useRef(true);
    //useEffect(() => {
    //    if (firstRecordUpdate.current) {
    //        firstRecordUpdate.current = false;
    //        return;
    //    }
    //    console.log("Record is updated");
    //    console.log(record);
    //}, [record]);

    const [{ record }, { onChange }] = useEAVForm((state) => ({ record: state.formValues }), "ModelDrivenForm FormValues");
    useEffect(() => { console.log("ModelDrivenForm FormValues changed", record) }, [record]);

    const { evaluatedForm, isLoadingForm } = useEvaluateFormDefinition(form, record, formName, entityName);
    const formHostContextValue = useMemo(() => ({ formDefinition: evaluatedForm }), [evaluatedForm]);

    const _onFormDataChange = useCallback((newformdata) => { onChange(form => { Object.assign(form, newformdata); }) }, [onChange]);
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

    const forms = entity?.forms ?? {};

    const hasMoreForms = Object.keys(forms).filter(f => forms[f].type === "Main").length > 1;

    const primaryField = useMemo(() => Object.values(app.getAttributes(entityName)).find((a) => a.isPrimaryField)!, [entityName]);
    const primaryFieldValue = useMemo(() => record[primaryField?.logicalName], [primaryField, entityName]);
    console.log("EntityName", [record, entityName, primaryField, primaryFieldValue])

    if (!evaluatedForm || !tabs.length || isLoading) {

        return <div style={wrapperStyle}>
            <ShimmerElementsGroup
                shimmerElements={[
                    { type: ShimmerElementType.line, width: 180, height: 50 },
                    { type: ShimmerElementType.gap, width: 130, height: 30 },
                ]}
            />
            <ShimmerElementsGroup
                flexWrap
                shimmerElements={[
                    { type: ShimmerElementType.line, width: 70, height: 30 },
                    { type: ShimmerElementType.line, width: 70, height: 30 },
                    { type: ShimmerElementType.gap, width: 70, height: 30 },
                ]}
            />
        </div>

        //   return <div>loading form...</div>
    }



    if (isLoadingForm)
        return <div>loading..</div>


    return <Stack verticalFill className="model-drive-form">
         
            <RibbonHost ribbon={evaluatedForm?.ribbon ?? form.ribbon ?? {}}>
                <FormHostContext.Provider value={formHostContextValue}>

                    {evaluatedForm?.type !== "QuickCreate" && <Stack.Item styles={{ root: { marginLeft: 15, paddingTop: 8 } }}>
                        <h2>{primaryFieldValue}</h2>
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
                        <FormComponent onFormDataChange={_onFormDataChange} {... { tabs, getTabName, entity, formName, locale, factory, extraErrors }}
                            form={evaluatedForm}
                            formData={record}
                            formContext={{ descriptions: descriptions, locale: locale, isCreate: record.id ? false : true, formData: record, onFormDataChange: _onFormDataChange }}

                        />
                    </Stack.Item>
                </FormHostContext.Provider>
            </RibbonHost>

    </Stack>
}

const useObservable = (value: any, ...deps: any[]) => {

    const oldvalue = useRef(value);
    const oldvalues = useRef(deps);
    //const [state,setState] = useState(value);
    useEffect(() => {
        console.log("useObservalbe:", [value, ...deps, oldvalues.current.some((c, i) => c !== deps[i])]);
        if (oldvalues.current.some((c, i) => c !== deps[i]) && oldvalue.current !== value) {
            oldvalues.current = deps;
            oldvalue.current = value;
            //    setState(value);
        }
    }, [value, ...deps])

    return oldvalue.current;
}

export const ModelDrivenEntityViewer: React.FC<ModelDrivenEntityViewerProps> = (props) => {

    const compID = useUuid();
    console.log("ModelDrivenEntityViewer: ID", [compID]);

    const app = useModelDrivenApp();
    const info = useAppInfo();

    const { record: record2, onChangeCallback, extraErrors: extraErrors2 } = useFormChangeHandlerProvider();
    const { record = record2, entityName, formName, entity, onChange = onChangeCallback, related, extraErrors = extraErrors2 } = props;
    const { events } = useRibbon();
   
   

    console.log("ModelDrivenEntityViewer:", [record, record?.name, entityName, formName]);

    const form = useMemo(() => getForm(app, entityName, formName), [app, entityName, formName]);

    //  const [form, setForm] = useState<FormDefinition>(getForm(app, entity, formName));

    //const firstFormUpdate = useRef(true);
    //useEffect(() => {
    //    if (firstFormUpdate.current) {
    //        firstFormUpdate.current = false;
    //        return;
    //    }
    //    setForm(getForm(app, entity, formName));
    //}, [entity, formName]);

    const formdatamerger = useRef({});

    const formDataRef = useRef(record);
    //  const [etag, setEtag] = useState(new Date().toISOString());

    //  const outerRecord = useObservable(record, info.currentRecordId, info.currentEntityName);

    const groups = useMemo(() => createRadioGroups(form, entity), [form, entity]);

    const onCommitCollector = useRef<Function>();

    const onFormDataChange2 = useCallback((formdata: any, ctx?: any) => {
        try {
            formdatamerger.current = {};
            onCommitCollector.current = undefined;
            console.groupCollapsed("onFormDataChange", [formDataRef.current, formdata]);
            let oldFormData = Object.assign({}, formDataRef.current);
            let changed = false;

            let attributes = [...Object.keys(entity.attributes), ...(Object.keys((entity.TPT && app.getEntity(entity.TPT).attributes) ?? {}))];

            while (attributes.length > 0) {
                let attributeKey = attributes.shift()!;
                console.debug("partOfGroup", attributeKey);
                let attribute = entity.attributes[attributeKey] ?? app.getEntity(entity.TPT!).attributes[attributeKey];

                if (attribute.logicalName in formdata || (isLookup(attribute.type) && attribute.logicalName.slice(0, -2) in formdata)) {
                    console.log(`Found ${attribute.logicalName} in formdata. type=${attribute.type}`);


                    if (oldFormData[attribute.logicalName] !== formdata[attribute.logicalName]) {

                        console.log(`Found ${attribute.logicalName} in formdata that changed from '${oldFormData[attribute.logicalName]}' to '${formdata[attribute.logicalName]}'`);

                        oldFormData[attribute.logicalName] = formdata[attribute.logicalName];
                        if (formdata[attribute.logicalName] === undefined) {                           

                            /**
                             * 
                             * If the old data prioer to changing contains
                             * {
                             *    addresssid = 5,
                             *    addresss = {... id=5}
                             * }
                             * and current data
                             * {
                             *    addressid = undefined
                             * }
                             */
                           
                            delete oldFormData[attribute.logicalName.slice(0, -2)];
                            oldFormData[attribute.logicalName] = null;
                        }
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

            console.log("ModelDrivenEntityViewer: oldFormData", oldFormData);
            console.log("ModelDrivenEntityViewer: formDataRef.current", formDataRef.current);
            console.log("ModelDrivenEntityViewer: changed", changed);

            if (changed) {
                formDataRef.current = oldFormData;
                onChange?.(oldFormData, ctx);
                // setEtag(new Date().toISOString());
            }

        } finally {
            console.groupEnd();
        }
    }, [record, entity]);



    //Collect all the incoming changes, latest is newest
    //debounce and update.
    const onFormDataChange = useCallback((formdata: any, ctx?: any) => {

        console.log("FormData Changing", { changes: formdata, old: formdatamerger.current, ctx });

        formdatamerger.current = { ...formdatamerger.current, ...formdata }; //TODO - should this be a deep merge.
        if (ctx?.onCommit) {
            const old = onCommitCollector.current;
            const next = ctx?.onCommit;
            onCommitCollector.current = () => {
                console.log("onFormDataChange Wrap", [next, old]);
                if (old)
                    old();

                next();
            }
        }

        

        console.log("FormData Changed", { changes: formdata, new: formdatamerger.current });


        onFormDataChange2(formdatamerger.current, { onCommit: onCommitCollector.current });
        setTimeout(() => {
        if (ctx?.autoSave)
        {
            events.emit('onSave');
        }});
    }, [onFormDataChange2]);

    /**
     * When recordid or entityname changes, reset to other record.
     **/
    useEffect(() => {
        console.log("Changing form record state from outside", [record, record?.name, info.currentRecordId, info.currentEntityName]);
        onFormDataChange(record)
    }, [record]);

    return (
        <EAVForm defaultData={formDataRef.current} onChange={onFormDataChange}>
            <ModelDrivenForm  {...props} record={record} onChange={onChange} extraErrors={extraErrors} form={form} />
        </EAVForm>
    );

}

export default ModelDrivenEntityViewer
