import {AttributeDefinition, EntityDefinition, getNavigationProperty, getRecordSWR, IRecord, isLookup, isPolyLookup} from "@eavfw/manifest";
import {useRouter} from "next/router";
import {createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {cleanDiff, deepDiffMapper} from "@eavfw/utils";
import {useModelDrivenApp} from "../../useModelDrivenApp";
import {errorMessageFactory, successMessageFactory, useMessageContext} from "../MessageArea";
import {useProgressBarContext} from "../ProgressBar";
import {useRibbon} from "../Ribbon";
import { handleValidationErrors } from "../../Validation";
import { FormValidation } from "@rjsf/utils";
import {useAppInfo} from "../../useAppInfo";

export type FormDataContextProps = {
    mutate: () => void;
    record?: IRecord;
    isLoading: boolean;
    onChangeCallback: (formData: any, ctx?: any) => void;
    addExpand: (str: string) => (() => void);
    extraErrors?: FormValidation
}
const FormDataContext = createContext<FormDataContextProps>({
    mutate: () => { },
    isLoading: false,
    onChangeCallback: (data, ctx) => { },
    addExpand: (str: string) => {
        return () => { } }
});
export const useFormChangeHandlerProvider = () => useContext(FormDataContext);
export const FormChangeHandlerProvider: React.FC<PropsWithChildren<{ recordId?: string }>> = ({ children, recordId }) => {

    const app = useModelDrivenApp();
    const router = useRouter();

    if (!router.query.area || !router.query.entityName)
        return <div>loading </div>

    const entity = app.getEntity(router.query.entityName as string);
    const formName = router.query.formname as string;
   
    const attributes = Object.values(entity.attributes).map(a => a.logicalName);
    // const [record, setRecord] = useState(Object.fromEntries(Object.keys(router.query).filter(logicalName => attributes.indexOf(logicalName) !== -1).map(k => [k, router.query[k]])));
    const entityName = router.query.entityName as string;

    const value = useFormChangeHandler(entity, recordId, recordId? undefined: Object.fromEntries(Object.keys(router.query).filter(logicalName => attributes.indexOf(logicalName) !== -1).map(k => [k, router.query[k]])));

    if (value.isLoading) return <div>loading</div>;

    return <FormDataContext.Provider value={value} key={`${router.query.entityName}${formName}${value?.record?.id}`}>{children}</FormDataContext.Provider>
}

export function useFormChangeHandler(entity: EntityDefinition, recordId?: string, initialdata?: any) {
    const router = useRouter();
  //  const [_, setEtag] = useState(new Date().toISOString());

    const { currentAppName, currentAreaName } = useAppInfo();
    const app = useModelDrivenApp();
    const [extraErrors, setExtraErrors] = useState({} as FormValidation);
    const attributes = useMemo(() => ({...((entity.TPT && app.getEntity(entity.TPT).attributes) ?? {}), ...entity.attributes}), [entity.logicalName]);
    const formName = router.query.formname as string;
    const formQuery = useMemo(() => entity.forms?.[formName]?.query, [formName]);

    const {skipRedirect, updateState: updateRibbonState, saveCompleted, events} = useRibbon();

    const entitySaveMessageKey = 'entitySaved';
    const {addMessage, removeMessage} = useMessageContext();
    const { showIndeterminateProgressIndicator, hideProgressBar } = useProgressBarContext();

    const defaultData = useMemo(() => {

        var data = initialdata;
        if (typeof (recordId) === "undefined") {
            for (let attr of Object.values(attributes)) {
                if (typeof (attr.default) !== "undefined") {
                    data = data ?? {};
                    data[attr.logicalName] = attr.default;
                }
            }
        }
        console.log("DEFAULT DATA", data);
        return data ;

    }, [initialdata,attributes]);

    const [localExpands, setExpands] = useState<string[]>([]);
    const addExpand = useCallback((str: string) => {
       
        setExpands((old) => [...old, str]);
        return () => {
            setExpands((old) => old.filter(x=>x!== str));
        };
    }, []);
    const expand = useMemo(() => {

        if (formQuery?.version === "1.0") {
            let form = entity.forms?.[formName];
            let columns = form?.columns ?? {};
            let expand = Object.entries(attributes).filter(([k, a]) => k in columns && columns[k].query?.expand !== false && isLookup(a.type)).map(([k, a]) => getNavigationProperty(a)).join(',');

            return expand;
        }


        function expandLookup(a: AttributeDefinition) {
            
            let type = a.type;
           
            if (isPolyLookup(type)) {
                if (type.split) {

                    return type.referenceTypes.map(k => {
                        let referenceSchemaName = `${entity.schemaName}${app.getEntityFromKey(k).schemaName}References`;
                        let reference = app.getEntityFromCollectionSchemaName(referenceSchemaName);
                        return `${referenceSchemaName}($select=${app.getSelectQueryParamForExpand(reference)};$expand=${app.getExpandQueryParam(reference) })`
                    })

                }
            }
            return [getNavigationProperty(a)];
        }
        let expand = Object.values(attributes)
            .filter(a => isLookup(a.type) && !(a.type.inline))
            .map(expandLookup)
            .flat()
            .concat(localExpands).join(',');
        if (formQuery?.["$expand"]) {
            expand = expand + ',' + formQuery["$expand"]
        }
        return expand;
    }, [attributes, recordId, formQuery?.["$expand"], localExpands]);

    const { record, isLoading, mutate } =
        getRecordSWR(
            entity.collectionSchemaName,
            recordId!,
            expand ? `?$expand=${expand}` : '',
            typeof (recordId) !== "undefined",
            defaultData
        );

    const changedRecord = useRef(record);

    const onChangeCallback = useCallback((formData: any, ctx?: any) => {
      //  console.group("CreateNewRecordPage");
        console.log("onChangeCallback",formData);
        try {
            changedRecord.current = formData;

            const [changed, changedValues] = cleanDiff(deepDiffMapper.map(recordId ? record : {}, changedRecord.current))
            
            console.log("onChangeCallback UpdatedValues", [JSON.stringify( changedRecord.current),JSON.stringify( record),
                deepDiffMapper.map(changedRecord.current, record), deepDiffMapper.map(record, changedRecord.current),
                changed, changedValues]);

            setTimeout(() => {
                console.log("onChangeCallback UpdatedValues", [changedRecord.current, record,
                deepDiffMapper.map(changedRecord.current, record), deepDiffMapper.map(record, changedRecord.current),
                    changed, changedValues]);

                console.log("onChangeCallback", [changed, changedValues, changedRecord.current]);
                updateRibbonState({ canSave: changed });
                if (ctx?.onCommit) {
                    console.log("RUNNING COMMIT HANDLE");
                    ctx.onCommit();
                }
            });
        } finally {
          //  console.groupEnd();
        }
    }, [record?.rowversion ?? record]);

    useEffect(() => {
        const entitySaveMessageKey = 'entitySaved';
        const onSaveCallBack = async () => {
            console.log("onChangeCallback", [changedRecord.current]);
            showIndeterminateProgressIndicator();
            updateRibbonState({canSave: false, skipRedirect: false});

            let rsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entity.collectionSchemaName}/records${recordId ? `/${recordId}` : ``}`, {
                method: recordId ? "PATCH" : "POST",
                body: JSON.stringify(changedRecord.current),
                credentials: "include"
            });

            hideProgressBar();

            if (rsp.ok) {
                console.log("Saved", [skipRedirect, recordId]);
                let data = await rsp.json();
                console.log(data);
                if (!skipRedirect && !recordId) {
                    router.pathname = app.recordUrl({
                        recordId: data.id,
                        entityName: entity.logicalName,
                        appName: currentAppName,
                        areaName: currentAreaName
                    });// "/apps/[appname]/areas/[area]/entities/[entityName]/records/[recordId]/forms/[formname]";
                    router.query.recordId = data.id;

                    router.replace(router, undefined, {shallow: true});
                } else {
                  //  setEtag(new Date().toISOString());
                    mutate();
                }

                saveCompleted({entityName: entity.logicalName, id: data.id});

                addMessage(entitySaveMessageKey, successMessageFactory({
                    key: entitySaveMessageKey,
                    removeMessage: removeMessage
                }, app));


                return 1;
            }

            const {errors, extraErrors} = await handleValidationErrors(rsp, app);

            setExtraErrors(extraErrors);

            addMessage(entitySaveMessageKey, errorMessageFactory({
                key: entitySaveMessageKey,
                removeMessage: removeMessage, messages: errors
            },app));
             
            saveCompleted({entityName: entity.logicalName});

            return 0;
        };

        const onSaveAndCloseCallback = async () => {
            console.log("closing");

            updateRibbonState({skipRedirect: true});

            if (await onSaveCallBack())
                router.back();

            console.log("closed");
        }

        events.on("onSave", onSaveCallBack);
        events.on("onSaveAndClose", onSaveAndCloseCallback);
        return () => {
            console.log("disposing onSave")
            hideProgressBar();
            events.off("onSave", onSaveCallBack);
            events.off("onSaveAndClose", onSaveAndCloseCallback);
        }
    }, [record, recordId, entity.collectionSchemaName,router.query.tabName])

    useEffect(() => {
        // useRef could be used here to avoid running on first render,
        // but it's not worth it.
        return () => {
            removeMessage(entitySaveMessageKey);
        };
    }, [recordId])

    console.log("RecordData", [recordId, record, isLoading, typeof (record) === "undefined"]);
    return {
        onChangeCallback,
        record,
        isLoading: typeof (recordId) === "undefined" ? false : (isLoading || typeof (record) === "undefined"),
        extraErrors,
        mutate,
        addExpand
    };
}
