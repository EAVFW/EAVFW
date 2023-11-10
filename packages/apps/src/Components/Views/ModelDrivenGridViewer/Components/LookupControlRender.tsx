import React, {
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Stack,
    CommandBar,
    Modal,
    MessageBar,
    MessageBarType,
} from "@fluentui/react";
import { FormValidation } from "@rjsf/utils";
import { useBoolean } from "@fluentui/react-hooks";
import {
    AttributeDefinition,
    LookupType,
} from "@eavfw/manifest";
import { useRibbon } from "../../../Ribbon/useRibbon";
import {
    errorMessageFactory,
    useMessageContext,
} from "../../../MessageArea/MessageContext";
import { useProgressBarContext } from "../../../ProgressBar/ProgressBarContext";
import { handleValidationErrors } from "../../../../Validation/handleValidationErrors";
import { LazyFormRender } from "../../../Forms/LazyFormRender";
import { useModelDrivenApp } from "../../../../useModelDrivenApp";

export type LookupControlRenderProps = {
    recordRouteGenerator: any;
    item: any;
    attribute: AttributeDefinition;
    type: LookupType;
    onChange?: any;
};

export const LookupControlRender: React.FC<LookupControlRenderProps> = ({
    item,
    attribute,
    type,
    recordRouteGenerator,
    onChange,
}) => {
    const [isOpen, { setFalse, setTrue }] = useBoolean(false);
    const save = useRibbon();
    const app = useModelDrivenApp();

    const recordRef = useRef<any>(item[attribute.logicalName.slice(0, -2)]);
    const _onDataChange = useCallback((data: any) => {
        console.log("LookupControlRender-OnDataChange", data);
        recordRef.current = data;
    }, []);

    const [extraErrors, setExtraErrors] = useState({} as FormValidation);
    const entitySaveMessageKey = "entitySaved";
    const { addMessage, removeMessage } = useMessageContext();
    const { showIndeterminateProgressIndicator, hideProgressBar } =
        useProgressBarContext();

    let entity = app.getEntity(type.foreignKey?.principalTable!);
    const attributes = useMemo(
        () => ({
            ...((entity.TPT && app.getEntity(entity.TPT).attributes) ?? {}),
            ...entity.attributes,
        }),
        [entity.logicalName]
    );

    const _onModalDismiss = useCallback(async (data: any) => {
        console.log(data);
        setFalse();
        if (data === "save") {
            showIndeterminateProgressIndicator();

            let plain = Object.fromEntries(
                Object.values(attributes).map((v) => [
                    v.logicalName,
                    recordRef.current[v.logicalName],
                ])
            );
            let rsp = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entity.collectionSchemaName}/records/${recordRef.current.id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(plain),
                    credentials: "include",
                }
            );

            if (rsp.ok) {
                for (let k of Object.keys(plain)) {
                    item[attribute.logicalName.slice(0, -2)][k] = plain[k];
                }

                if (onChange) onChange(item);

                addMessage(entitySaveMessageKey, (props?: any) => (
                    <MessageBar
                        messageBarType={MessageBarType.success}
                        {...props}
                        onDismiss={() => removeMessage(entitySaveMessageKey)}
                    >
                        {app.getLocalization("entitySaved") ?? <>Entity have been saved!</>}
                    </MessageBar>
                ));
            } else {
                const { errors, extraErrors } = await handleValidationErrors(rsp, app);

                setExtraErrors(extraErrors);

                addMessage(
                    entitySaveMessageKey,
                    errorMessageFactory({
                        key: entitySaveMessageKey,
                        removeMessage: removeMessage,
                        messages: errors,
                    })
                );
            }

            hideProgressBar();
        }
    }, []);

    const _onClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (save.canSave) {
            const _once = () => {
                save.events.off("saveComplete", _once);
                setTrue();
            };
            save.events.on("saveComplete", _once);
            save.events.emit("onSave");
        } else {
            setTrue();
        }
        return false;
    };

    return (
        <>
            <Modal isOpen={isOpen} onDismiss={setFalse} isBlocking={true}>
                <Stack
                    verticalFill
                    styles={{ root: { minWidth: "60vw", maxWidth: "90vw" } }}
                >
                    <Stack horizontal>
                        <Stack.Item grow>
                            <CommandBar
                                id="ModalRibbonBarCommands"
                                items={[]}
                                farItems={[
                                    {
                                        key: "close",
                                        ariaLabel: "Info",
                                        iconOnly: true,
                                        iconProps: { iconName: "Cancel" },
                                        onClick: setFalse,
                                    },
                                ]}
                                ariaLabel="Use left and right arrow keys to navigate between commands"
                            />
                        </Stack.Item>
                    </Stack>

                    <LazyFormRender
                        extraErrors={extraErrors}
                        record={recordRef.current}
                        entityName={type.foreignKey?.principalTable}
                        dismissPanel={_onModalDismiss}
                        onChange={_onDataChange}
                    />
                </Stack>
            </Modal>
            <a href="#" onClick={_onClick}>
                {item[
                    attribute.logicalName.endsWith("id")
                        ? attribute.logicalName.slice(0, -2)
                        : attribute.logicalName
                ][type.foreignKey?.principalNameColumn?.toLowerCase()!] ??
                    "<ingen navn>"}
            </a>
            { }
        </>
    );
};