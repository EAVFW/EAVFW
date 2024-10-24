import { EntityDefinition, FormDefinition, LookupType } from "@eavfw/manifest";
import { DefaultButton, MessageBar, MessageBarType, PrimaryButton, Stack, Sticky, StickyPositionType } from "@fluentui/react";
import React, { PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { capitalize } from "@eavfw/utils";
import { useModelDrivenApp } from "../../useModelDrivenApp";
import { FormRenderProps } from "./FormRenderProps";
import ModelDrivenEntityViewer from "./ModelDrivenEntityViewer";
import { ResolveFeature } from "../../FeatureFlags";
import { errorMessageFactory, useMessageContext } from "../../Components/MessageArea";

export type PreSaveValidator = (data: any, e: EntityDefinition) => PreSaveValidatorResult;
export interface PreSaveValidatorResult { success: boolean, msg?: string };

const buttonStyles = { root: { marginRight: 8 } };

/**
 * 
 * FormRender - Renders a form for a given entity. 
 * Using a ref to store record data to avoid re-rendering the form when the record changes.
 * 
 * Use a new key for the component if a complete re-render is needed when outer record data is changed.
 * 
 * @param props
 * @returns
 */
export function FormRender<T>(props: FormRenderProps) {
    const { dismissPanel, onChange, extraErrors, hideFooter } = props;
    const app = useModelDrivenApp();
    const entityName = props.entityName ?? (props.type as LookupType).foreignKey?.principalTable!;
    const entity = app.getEntity(entityName);
    const forms = entity.forms!;

    const formName = props.formName ?? (props.forms ?? Object.keys(forms).filter(k => forms[k].type === "Modal"))[0]
    const saveBtnText = props.saveBtnText?? forms?.[formName]?.buttons?.save?.text      //gets text for naming of save btn in modal if it is defined
    const cancelBtnText = props.cancelBtnText ?? forms?.[formName]?.buttons?.cancel?.text  //gets text for naming of cancel btn in modal if it is defined

    const record = useRef(props.record ?? {});
    //const [record, setRecord] = useState({ ...props.record ?? {} });
    const related = useMemo(() => app.getRelated(entity.logicalName), [entity.logicalName]);
    const [preSaveValidators, setPreSaveValidators] = useState<PreSaveValidator[]>([]);
    const { addMessage, removeMessage } = useMessageContext();
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const _onSave = () => {

        console.log("Closing Modal", record.current);
        var results = preSaveValidators.map((c) => c(record.current, entity))
        if (results.every(r => r.success === true)) {
            onChange(record.current, { autoSave: preSaveValidators.length > 0 });
            setErrorMsg(undefined);
            dismissPanel.call(undefined, "save");
        }
        else {
            const errors = results.filter(s => !s.success && s.msg).map(m => m.msg!);
            setErrorMsg(errors.join(", "));
            addMessage('entitySaved', errorMessageFactory({
                key: 'entitySaved',
                messages: errors,
                removeMessage: removeMessage
            }));
        }
    };

    useEffect(() => {
        const form = forms[formName];
        if (form?.scripts?.preSave) {
            Object.getOwnPropertyNames(form.scripts.preSave).forEach(name => {
                const preSave = ResolveFeature(form.scripts!.preSave![name]) as PreSaveValidator;
                if (preSave) {
                    setPreSaveValidators([...preSaveValidators, preSave]);
                }
            })
        }
    }, []);

    //useEffect(() => {
    //    console.log("FormRender, Record Updated:", props.record)
    //    //  record.current = props.record;
    //    if (props.record)
    //        setRecord(props.record);
    //}, [props.record]);

    const StickyFooter: React.FC<PropsWithChildren> = React.useCallback(({ children }) => (props.stickyFooter ?? true) ? <Sticky stickyPosition={StickyPositionType.Footer}>{children}</Sticky> : <>{children}</>, [props.stickyFooter]);

    const RenderFooterContent = React.useCallback(
        () => (
            <Stack horizontal horizontalAlign="end" style={{margin: 24 }}>
                {errorMsg && <MessageBar messageBarType={MessageBarType.error}>{errorMsg}</MessageBar>}
                <PrimaryButton onClick={_onSave} styles={buttonStyles}>
                    {saveBtnText ?? (capitalize(app.getLocalization("save") ?? 'Save'))}
                </PrimaryButton>
                <DefaultButton
                    onClick={dismissPanel.bind(undefined, "cancel")}>
                    {cancelBtnText ?? (capitalize(app.getLocalization("close") ?? 'Close'))}
                </DefaultButton>
            </Stack>
        ),
        [dismissPanel, record],
    );

    const _onChange = useCallback((data: any) => {
        console.log("FormRender, Data changed Modal", data);
         record.current = data;
       // setRecord(data);
        onChange(data);
    }, []);

    //useEffect(() => {
    //    console.log("FormRender outer changed:", props.record);

    //}, [props.record]);

    return <>
        <Stack.Item grow style={{ height: 'calc(100% - 80px)' }}>
            <ModelDrivenEntityViewer key={`${entityName}${formName}`} related={related} onChange={_onChange} record={record.current} formName={formName}
                entityName={entityName} entity={entity} locale={app.locale} extraErrors={extraErrors} />
            {!hideFooter && <RenderFooterContent />}
        </Stack.Item>
    </>
}