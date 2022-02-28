import { LookupType } from "@eavfw/manifest";
import { DefaultButton, PrimaryButton, Stack, Sticky, StickyPositionType } from "@fluentui/react";
import React, { useEffect, useMemo, useRef } from "react";
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

    const record = useRef(props.record ?? {});
    const related = useMemo(() => app.getRelated(entity.logicalName), [entity.logicalName]);

    const _onSave = () => {
        onChange(record.current);
        dismissPanel.call(undefined, "save");
    };
    useEffect(() => {
        record.current = props.record;
    }, [props.record]);

    const StickyFooter = React.useCallback(({ children }) => (props.stickyFooter ?? true) ? <Sticky stickyPosition={StickyPositionType.Footer}>{children}</Sticky> : <>{children}</>, [props.stickyFooter]);

    const RenderFooterContent = React.useCallback(
        () => (
            <StickyFooter>
                <Stack horizontal horizontalAlign="end" styles={{ root: { margin: 24 } }}>
                    <PrimaryButton onClick={_onSave} styles={buttonStyles}>
                        {capitalize(app.getLocalization("save") ?? 'Save')}
                    </PrimaryButton>
                    <DefaultButton
                        onClick={dismissPanel.bind(undefined, "cancel")}>{capitalize(app.getLocalization("close") ?? 'Close')}</DefaultButton>
                </Stack>
            </StickyFooter>
        ),
        [dismissPanel],
    );

    return <>
        <Stack.Item grow style={{ height: 'calc(100% - 80px)' }}>

            <ModelDrivenEntityViewer related={related} onChange={(data) => record.current = data} record={props.record} formName={formName}
                entityName={entityName} entity={entity} locale={app.locale} extraErrors={extraErrors} />

        </Stack.Item>
        <RenderFooterContent />
    </>
}