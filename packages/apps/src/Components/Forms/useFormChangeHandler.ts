import {EntityDefinition, getNavigationProperty, getRecordSWR, isLookup} from "@eavfw/manifest";
import {useRouter} from "next/router";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {cleanDiff, deepDiffMapper} from "@eavfw/utils";
import {useModelDrivenApp} from "../../useModelDrivenApp";
import {errorMessageFactory, successMessageFactory, useMessageContext} from "../MessageArea";
import {useProgressBarContext} from "../ProgressBar";
import {useRibbon} from "../Ribbon";
import {handleValidationErrors} from "../../Validation";
import {FormValidation} from "@rjsf/core";
import {useAppInfo} from "../../useAppInfo";

export function useFormChangeHandler(entity: EntityDefinition, recordId?: string, initialdata?: any) {
    const router = useRouter();
    const [_, setEtag] = useState(new Date().toISOString());

    const { currentAppName, currentAreaName } = useAppInfo();
    const app = useModelDrivenApp();
    const [extraErrors, setExtraErrors] = useState({} as FormValidation);
    const attributes = useMemo(() => ({...((entity.TPT && app.getEntity(entity.TPT).attributes) ?? {}), ...entity.attributes}), [entity.logicalName]);
    const formName = router.query.formname as string;
    const formQuery = useMemo(() => entity.forms?.[formName]?.query, [formName]);

    const {skipRedirect, updateState: updateRibbonState, saveCompleted, events} = useRibbon();

    const entitySaveMessageKey = 'entitySaved';
    const {addMessage, removeMessage} = useMessageContext();
    const {showIndeterminateProgressIndicator, hideProgressBar} = useProgressBarContext();

    const expand = useMemo(() => {

        let expand = Object.values(attributes).filter(a => isLookup(a.type)).map(a => getNavigationProperty(a)).join(',');
        if (formQuery?.["$expand"]) {
            expand = expand + ',' + formQuery["$expand"]
        }
        return expand;
    }, [attributes, recordId, formQuery?.["$expand"]]);

    const {record, isLoading} =
        getRecordSWR(
            entity.collectionSchemaName,
            recordId!,
            expand ? `?$expand=${expand}` : '',
            typeof (recordId) !== "undefined",
            initialdata
        );

    const changedRecord = useRef(record);

    const onChangeCallback = useCallback((formData: any) => {
        console.group("CreateNewRecordPage");
        console.log(formData);
        try {
            changedRecord.current = formData;

            const [changed, changedValues] = cleanDiff(deepDiffMapper.map(recordId ? record : {}, changedRecord.current))
            console.log("UpdatedValues", [changedRecord.current, record,
                deepDiffMapper.map(changedRecord.current, record), deepDiffMapper.map(record, changedRecord.current),
                changed, changedValues]);

            updateRibbonState({canSave: changed});
        } finally {
            console.groupEnd();
        }
    }, [record]);

    useEffect(() => {
        const entitySaveMessageKey = 'entitySaved';
        const onSaveCallBack = async () => {
            showIndeterminateProgressIndicator();
            updateRibbonState({canSave: false, skipRedirect: false});

            let rsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entity.collectionSchemaName}/records${recordId ? `/${recordId}` : ``}`, {
                method: recordId ? "PATCH" : "POST",
                body: JSON.stringify(changedRecord.current),
                credentials: "include"
            });

            hideProgressBar();

            if (rsp.ok) {
                console.log("Saved");
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
                    setEtag(new Date().toISOString());
                }

                saveCompleted({entityName: entity.logicalName, id: data.id});

                addMessage(entitySaveMessageKey, successMessageFactory({
                    key: entitySaveMessageKey,
                    removeMessage: removeMessage
                }));


                return 1;
            }

            const {errors, extraErrors} = await handleValidationErrors(rsp, app);

            setExtraErrors(extraErrors);

            addMessage(entitySaveMessageKey, errorMessageFactory({
                key: entitySaveMessageKey,
                removeMessage: removeMessage, messages: errors
            }));
             
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
        extraErrors
    };
}