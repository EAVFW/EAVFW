import { LookupType } from "@eavfw/manifest";
import { DefaultButton, PrimaryButton, Stack, Sticky, StickyPositionType } from "@fluentui/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { capitalize } from "@eavfw/utils";
import { useModelDrivenApp } from "../../useModelDrivenApp";
import { FormRenderProps } from "./FormRenderProps";
import ModelDrivenEntityViewer from "./ModelDrivenEntityViewer";


const buttonStyles = { root: { marginRight: 8 } };



export function FormRender<T>(props: FormRenderProps) {
    const { dismissPanel, onChange, extraErrors } = props;
    const app = useModelDrivenApp();
    const entityName = props.entityName ?? (props.type as LookupType).foreignKey?.principalTable!;
    const entity = app.getEntity(entityName);
    const forms = entity.forms!;
    console.log("FormRender", [entityName, entity, forms]);
    const formName = props.formName ?? (props.forms ?? Object.keys(forms).filter(k => forms[k].type === "Modal"))[0]
    const saveBtnText = forms?.[formName]?.buttons?.save?.text
    const cancelBtnText = forms?.[formName]?.buttons?.cancel?.text

    //  const record = useRef(props.record ?? {});
    const [record, setRecord] = useState(props.record ?? {});
    const related = useMemo(() => app.getRelated(entity.logicalName), [entity.logicalName]);

    const _onSave = () => {


        console.log("Closing Modal", record);


        onChange(record);
        dismissPanel.call(undefined, "save");
    };
    useEffect(() => {
        console.log("Form Render, Record Updated:", props.record)
        //  record.current = props.record;
        setRecord(props.record);
    }, [props.record]);

    const StickyFooter = React.useCallback(({ children }) => (props.stickyFooter ?? true) ? <Sticky stickyPosition={StickyPositionType.Footer}>{children}</Sticky> : <>{children}</>, [props.stickyFooter]);

    const RenderFooterContent = React.useCallback(
        () => (
            <Stack horizontal horizontalAlign="end" styles={{ root: { margin: 24 } }}>
                <PrimaryButton onClick={_onSave} styles={buttonStyles}>
                    {saveBtnText ?? 'test' + (capitalize(app.getLocalization("save") ?? 'Save'))}
                </PrimaryButton>
                <DefaultButton
                    onClick={dismissPanel.bind(undefined, "cancel")}>
                    {cancelBtnText ?? (capitalize(app.getLocalization("close") ?? 'Close'))}
                </DefaultButton>
            </Stack>
        ),
        [dismissPanel, record],
    );

    const _onChange = useCallback(data => {
        console.log("Data changed Modal", data);
        // record.current = data;
        setRecord(data);
    }, []);

    //useEffect(() => {
    //    console.log("FormRender outer changed:", props.record);

    //}, [props.record]);

    return <>
        <Stack.Item grow style={{ height: 'calc(100% - 80px)' }}>

            <ModelDrivenEntityViewer key={`${entityName}${formName}`} related={related} onChange={_onChange} record={record} formName={formName}
                entityName={entityName} entity={entity} locale={app.locale} extraErrors={extraErrors} />

            <RenderFooterContent />
        </Stack.Item>
    </>
}