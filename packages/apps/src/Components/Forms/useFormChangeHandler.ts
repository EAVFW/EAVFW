import { EntityDefinition, getNavigationProperty, isLookup } from "@eavfw/manifest";
import { NextRouter, useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cleanDiff, deepDiffMapper } from "@eavfw/utils";
import { useModelDrivenApp } from "../../useModelDrivenApp";
import { errorMessageFactory, successMessageFactory, useMessageContext } from "../MessageArea/MessageContext";
import { useProgressBarContext } from "../ProgressBar/ProgressBarContext";
import { useRibbon } from "../Ribbon/useRibbon";
import { useAppInfo } from "../../useAppInfo";
import { handleValidationErrors } from "../../Validation/handleValidationErrors";
import { FormValidation } from "@rjsf/core";

export function useFormChangeHandler(entity: EntityDefinition, recordId?: string, initialdata?: any) {

    const router = useRouter();
    const [etag, setEtag] = useState(new Date().toISOString());
    const [record, setRecord] = useState(initialdata);
    const changedRecord = useRef(record);
    const [isLoading, setIsLoading] = useState(recordId ? true : false);
    const app = useModelDrivenApp();
    const [extraErrors, setExtraErrors] = useState({} as FormValidation);
    const attributes = useMemo(() => ({ ...((entity.TPT && app.getEntity(entity.TPT).attributes) ?? {}), ...entity.attributes }), [entity.logicalName]);
    const formName = router.query.formname as string;
    const query = useMemo(() => entity.forms?.[router.query.formname as string]?.query, [router.query.formname]);

    const { skipRedirect, updateState: updateRibbonState, saveCompleted, events } = useRibbon();

    const entitySaveMessageKey = 'entitySaved';
    const { addMessage, removeMessage } = useMessageContext();
    const { showIndeterminateProgressIndicator, hideProgressBar } = useProgressBarContext();

    const onChangeCallback = useCallback((formData: any) => {
        console.group("CreateNewRecordPage");
        console.log(formData);
        try {

            //setTimeout(() => {
            // setRecord({ ...formData });
            changedRecord.current = formData;

            const [changed, changedValues] = cleanDiff(deepDiffMapper.map(recordId ? record : {}, changedRecord.current))
            console.log("UpdatedValues", [changedRecord.current, record,
            deepDiffMapper.map(changedRecord.current, record), deepDiffMapper.map(record, changedRecord.current),
                changed, changedValues]);

            updateRibbonState({ canSave: changed });
            //},0);
            //  record1.current = formData;

        } finally {
            console.groupEnd();
        }
    }, [record]);


    const { currentAppName, currentAreaName } = useAppInfo();

    useEffect(() => {
        const entitySaveMessageKey = 'entitySaved';
        const onSaveCallBack = async () => {


            showIndeterminateProgressIndicator();
            updateRibbonState({ canSave: false, skipRedirect: false });

           // console.log("Saving: ", [recordId ? record : {}, changedRecord.current, deepDiffMapper.map(changedRecord.current, record), deepDiffMapper.map(record, changedRecord.current)]);


          //  const [changed, changedValues] = cleanDiff(deepDiffMapper.map(recordId ? record : {}, changedRecord.current))

           // console.log("UpdatedValues Clean", [changedRecord.current, record,  changed, changedValues]);


            let rsp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entity.collectionSchemaName}/records${recordId ? `/${recordId}` : ``}`, {
                method: recordId ? "PATCH" : "POST",
                body: JSON.stringify(changedRecord.current),
                credentials: "include"
            });
            if (rsp.ok) {

                console.log("Saved");
                let data = await rsp.json();
                console.log(data);
                if (skipRedirect !== true && !recordId) {
                    let recordUrl = app.recordUrl({ recordId: data.id, entityName: entity.logicalName, appName: currentAppName, areaName: currentAreaName });
                    router.pathname = recordUrl;// "/apps/[appname]/areas/[area]/entities/[entityName]/records/[recordId]/forms/[formname]";
                    router.query.recordId = data.id;

                    router.replace(router, undefined, { shallow: true });
                    // console.log(recordUrl);
                } else {
                    setEtag(new Date().toISOString());
                }

                saveCompleted({ entityName: entity.logicalName, id: data.id });

                addMessage(entitySaveMessageKey, successMessageFactory({
                    key: entitySaveMessageKey,
                    removeMessage: removeMessage
                }));

                return 1;
            }






            const { errors, extraErrors } = await handleValidationErrors(rsp, app);

            setExtraErrors(extraErrors);

            addMessage(entitySaveMessageKey, errorMessageFactory({
                key: entitySaveMessageKey,
                removeMessage: removeMessage, messages: errors
            }));

            hideProgressBar();

            saveCompleted({ entityName: entity.logicalName });

            return 0;
        };
        const onSaveAndCloseCallback = async () => {
            console.log("closing");

            updateRibbonState({ skipRedirect: true });

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
    }, [record, router.query.tabName])

    useEffect(() => {
        // useRef could be used here to avoid running on first render, 
        // but it's not worth it.
        return () => {
            removeMessage(entitySaveMessageKey);
        };
    }, [router.query.recordId])

    if (recordId) {
        useEffect(() => {
            console.log("refreshing data");

            let expand = Object.values(attributes).filter(a => isLookup(a.type)).map(a => getNavigationProperty(a)).join(',');
            if (query?.["$expand"]) {
                expand = expand + ',' + query["$expand"]
            }

            let rsp = fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entity.collectionSchemaName}/records/${recordId}${(expand ? `?$expand=${expand}` : '')}`, {
                method: "GET",
                credentials: "include"
            }).then(rsp => {
                if (rsp.ok) {
                    rsp.json().then(data => {


                        //record1.current = data.value;
                        setRecord(data.value);

                        setIsLoading(false);
                    });
                }
            });

        }, [recordId, etag]);
    }

    return { onChangeCallback, record, setRecord, isLoading: isLoading, extraErrors };
}