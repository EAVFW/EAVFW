import {
    ComboBox,
    CommandBar,
    CommandButton,
    Dropdown,
    FontWeights,
    getTheme,
    IButtonStyles,
    IComboBox,
    IComboBoxOption,
    IDropdownOption,
    IDropdownStyleProps,
    IDropdownStyles,
    IIconProps,
    IStackProps,
    IStyleFunction,
    mergeStyleSets,
    Modal,
    Stack,
    StackItem,
    useTheme
} from "@fluentui/react";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EntityDefinition, getRecordSWR, IRecord, isLookup, isPolyLookup, LookupType, NestedType, queryEntity, queryEntitySWR, TypeFormModalDefinition } from "@eavfw/manifest";
import { capitalize, throwIfNotDefined } from "@eavfw/utils";
import { LookupControlProps } from "./LookupControlProps";
import { FormRender } from "../../Forms/FormRender";
import { FormValidation } from "../../Forms/FormValidation";
import { useModelDrivenApp } from "../../../useModelDrivenApp";
import { useEAVForm } from "@eavfw/forms";
import { EAVFormOnChangeCallbackContext, EAVFOrmOnChangeHandler } from "../../../../../forms/src/EAVFormContextActions";
import { useFormHost } from "../../Forms/ModelDrivenEntityViewer";
import { useAsyncMemo } from "../../../../../hooks/src";
import { isAttributeLookupEntry } from "../../ColumnFilter/ColumnFilterContext";




const DUMMY_DATA_KEY = "dummy";

const commandback: IButtonStyles = {
    root: {
        padding: 2,
        margin: 2,
    },
    flexContainer: {
        justifyContent: "center"
    }
};
const emojiIconClear: IIconProps = { iconName: 'Clear' };
const emojiIcon: IIconProps = { iconName: 'Add' };
const _styles: IStyleFunction<IDropdownStyleProps, IDropdownStyles> = (
    props
) => ({});

export type LookupCoreControlProps = {
    extraErrors: FormValidation,
    targetEntityName: string,
    logicalName: string,
    disabled?: boolean,
    label: string,
    errorMessage?: string,
    allowCreate?: boolean,
    filter?: string,
    forms?: string[],
    type: NestedType,
    selectedValue: any,
    value: any,
    onChange: EAVFOrmOnChangeHandler<any>,
    searchForLabel?: string
}
function nullIfEmpty<T>(items: T[]) {

    if (items)
        return items.length ? items : null;

    return null;
}

function returnQueryFilter(searchfilter: string | undefined, filter: string | undefined) {

    if (searchfilter && filter)     //both defined
        return { '$filter': searchfilter + ' and ' + filter };

    if (searchfilter && !filter)    //only searchfilter defined
        return { '$filter': searchfilter };

    if (filter && !searchfilter)    //only filter defined
        return { '$filter': filter };

    if (!filter && !searchfilter)
        return { '$filter': '' };     //neither defined
}


export const LookupCoreControl: React.FC<LookupCoreControlProps> = ({
    extraErrors,
    targetEntityName,
    logicalName,
    disabled,
    label,
    errorMessage,
    allowCreate,
    filter,
    forms,
    type,
    value,
    selectedValue,
    onChange,
    searchForLabel
}) => {

    const ref = useRef<IComboBox>(null);

    const app = useModelDrivenApp();
    const theme = useTheme();

    const [modalOpen, setmodalOpen] = useState(false);
    const _hideModal = () => setmodalOpen(false);
    const _showModal = () => setmodalOpen(true);

    const localization = {
        new: capitalize(app.getLocalization("new") ?? "New"),
        clear: capitalize(app.getLocalization("clear") ?? "Clear"),
    };

    const targetEntity = app.getEntity(targetEntityName) as EntityDefinition;
    const primaryField = app.getPrimaryField(targetEntityName);


    const [isFreeform, setIsFreeform] = useState(false);

    const [hasFilterChanged, setHasFilterChanged] = useState(false);
    const hasFilterChangedFirst = useRef(false);


    console.log("lookupcontrol", [selectedValue, targetEntity, primaryField, logicalName])
    const initialOptions = useMemo(() => (typeof (selectedValue) === "object" ? [{ key: selectedValue.id ?? DUMMY_DATA_KEY, text: selectedValue[primaryField] }] : []), [selectedValue]);

    const [shouldLoadRemoteOptions, setShouldLoadRemoteOptions] = useState(false);
    const [searchfilter, setSearchFilter] = useState<string>()
    const query = useMemo(() => ({ "$select": `id,${primaryField}`, "$top": 10, ...returnQueryFilter(searchfilter, filter) }), [filter, searchfilter]);
    const { data: remoteItems = { items: [] as Array<IRecord> }, isLoading: isLoadingRemoteData } = queryEntitySWR(targetEntity, query, shouldLoadRemoteOptions || typeof (searchfilter) === "string");

    const loadRemoteValue = useMemo(() => !!value && typeof (selectedValue) === "undefined" && (!shouldLoadRemoteOptions || !isLoadingRemoteData) && remoteItems?.items.filter(x => x.id === value).length === 0, [selectedValue, isLoadingRemoteData, remoteItems?.items]);
    const { record: remoteSelectedValue, isLoading: isLoadingRemoteSelectedValue } = getRecordSWR(app.getEntity(targetEntityName).collectionSchemaName, value, `?$select=id,${primaryField}`, loadRemoteValue);


    const remoteOptions = useMemo(() => (remoteItems?.items.filter(c => c.id !== remoteSelectedValue?.id).map(m => ({
        key: m.id,
        text: m[primaryField],
        data: m.id
    })) as IComboBoxOption[] ?? []).concat(remoteSelectedValue?.id ?
        [{ key: remoteSelectedValue.id, text: remoteSelectedValue[primaryField] }] : []), [remoteItems?.items, remoteSelectedValue]);



    const [selectedKey, setSelectedKey] = useState<string | null>(value ?? (typeof (selectedValue) === "object" ? selectedValue.id ?? DUMMY_DATA_KEY : undefined));

    const isLoading = useMemo(() => shouldLoadRemoteOptions && isLoadingRemoteData, [shouldLoadRemoteOptions, isLoadingRemoteData]);

    const localOptions = useRef<IDropdownOption[]>([]);

    const [dummyData, setDummyData] = useState<any>();

    const options = useMemo(() => (hasFilterChanged && shouldLoadRemoteOptions ? remoteOptions : remoteOptions.concat(localOptions.current).concat(initialOptions.filter(io => remoteOptions.filter(ro => ro.key === io.key).length === 0))),
        [initialOptions, remoteOptions, dummyData, hasFilterChanged]);


    useEffect(() => {
        if (!disabled && !!filter) {
            console.log("Lookup Control: filter changed", [label, filter]);

            if (hasFilterChangedFirst.current) {
                setHasFilterChanged(true);
                setSelectedKey(null);
            }
            hasFilterChangedFirst.current = true;
        }
    }, [disabled, filter]);

    /**
     * When a modal is submittet, it has changed the raw object data, but not persisted to database. 
     * Modals change data inline and first saved to db as part of triggering save data.
     * @param data
     */
    const _onModalSubmit = useCallback((data: any, localctx: EAVFormOnChangeCallbackContext) => {
        console.log("Submitting Modal", data);
        //let o = localOptions.current;
        //if (o.filter(o => o.key === DUMMY_DATA_KEY).length === 0)
        //    o.unshift({
        //        key: DUMMY_DATA_KEY,
        //        text: data[primaryField]
        //    });
        //else
        //    o.filter(o => o.key === DUMMY_DATA_KEY)[0].text = data[primaryField];

        // setOptions(o);
        setSelectedKey(DUMMY_DATA_KEY);
        setDummyData(data);

        onChange((props, ctx: EAVFormOnChangeCallbackContext) => {
            props[logicalName.slice(0, -2)] = data;
            
            ctx.autoSave = localctx?.autoSave;
            
        });

    }, []);


    /**
     * The callback for dropdown onchange event
     * */
    const _onChange = useCallback((
        event: React.FormEvent<IComboBox>,
        option?: IDropdownOption | IComboBoxOption,
        index?: number) => {

        console.log("LookupControl: on change", [event, option, index]);
        onChange(props => {            
            if (option?.key === "dummy") {
                delete props[logicalName];
                props[logicalName.slice(0, -2)] = dummyData
            } else {
                props[logicalName] = option?.data; //The id of selected value, but if key is dummy we picked the placeholder data
                delete props[logicalName.slice(0, -2)]; //Proper clean up by deleting the object part unless key is dummy placeholder
            }
        });

        setfreeformvalue(undefined)     //For not letting freeformvalue from searchfilter overwrite picked element
    }, [dummyData]);

    const resetValue = () => {
        //reset data
        onChange(props => {
            delete props[logicalName];
            props[logicalName.slice(0, -2)] = undefined
        });

        //reset text and lookup value
        setSelectedKey(null)
    }

    /*
     * If the value changes, then find and set key; Value is ids;
     * */
    useEffect(() => {
        console.log("LookupControl: setting selected key for " + logicalName, [value]);
        if (value && typeof value !== "object") {
            setSelectedKey(value);
        }
    }, [value]);


    //    const defaultOptions = useRef((typeof (selectedValue) === "object" ? [{ key: selectedValue.id ?? "dummy", text: selectedValue[primaryField] }] : []));

    //  const [options, setOptions] = useState<IDropdownOption[]>(defaultOptions.current);

    const [modalForms, setModalForms] = useState(forms ?? []);

    const placeHolder = `${app.getLocalization('searchFor') ?? 'Search for'} ${searchForLabel ?? targetEntity.locale?.[app.locale]?.displayName ?? targetEntity.displayName}`;
    const noResultText = app.getLocalization('noResults') ?? 'No results...';
    const loadingText = app.getLocalization('loading') ?? 'Loading...';
    const [freeformvalue, setfreeformvalue] = useState<string>();

    console.log("Lookup Control:", [label, disabled, isLoading, remoteItems, initialOptions, remoteOptions, options, filter, value, selectedValue, selectedKey, loadRemoteValue,
        !!value, typeof (selectedValue) === "undefined", !isLoadingRemoteData, remoteItems?.items.filter(x => x.id === value).length === 0]);
    return (<>
        <Modal isOpen={modalOpen} onDismiss={_hideModal} isBlocking={true} styles={{ scrollableContent: { overflowY: "hidden", maxHeight: "100%" } }}>
            <Stack verticalFill styles={{ root: { minWidth: "60vw", maxWidth: "90vw" } }}>
                <Stack horizontal>
                    <Stack.Item grow>
                        <CommandBar id="ModalRibbonBarCommands"
                            items={[]}
                            farItems={[{
                                key: 'close',
                                //  text: 'Info',
                                // This needs an ariaLabel since it's icon-only
                                ariaLabel: 'Info',
                                iconOnly: true,
                                iconProps: { iconName: 'Cancel' },
                                onClick: _hideModal,
                            }]}
                            ariaLabel="Use left and right arrow keys to navigate between commands"
                        />
                    </Stack.Item>
                </Stack>
                <FormRender forms={modalForms} type={type} dismissPanel={_hideModal} record={dummyData}
                    onChange={_onModalSubmit} extraErrors={extraErrors} />
            </Stack>
        </Modal>

        <ComboBox
            id={`${targetEntityName}_${logicalName}_combo`} 
            componentRef={ref}
            disabled={disabled}

            ariaLabel={label}
            styles={{
                callout: {
                    marginBottom:92
                },
                optionsContainerWrapper: {
                    maxHeight: "25vh"
                }, inputDisabled: {
                    background: theme?.palette.neutralLight, color: "black"
                }, rootDisabled: {
                    borderWidth: 1, borderStyle: "solid", borderColor: theme?.palette.black, background: theme?.palette.neutralLight
                }
            }}
            onChange={_onChange}
            onBlur={(_) => {
                setfreeformvalue(undefined);
            }}
            options={options}
            useComboBoxAsMenuWidth
            allowFreeform={isFreeform}
            text={freeformvalue}
            autofill={{
                onInputValueChange: (value) => {

                    setIsFreeform(true);
                    console.log("autofill->onInputValueChange->value:" + value + " , primaryField: " + primaryField);
                    ref.current?.focus(true);
                    setfreeformvalue(value);
                    setSearchFilter(`contains(${primaryField}, \'${value}\')`)

                    console.log("onInputValueChange has run");

                }
            }}
            onMenuOpen={() => setShouldLoadRemoteOptions(true)}
            autoComplete="off"
            placeholder={placeHolder}
            errorMessage={errorMessage}
            onItemClick={(e: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number) => {
                console.log("OnItemCLick", [e, option, index]);
                if (option?.key !== undefined && option.key === "dummy") {
                    _showModal();
                }

                setfreeformvalue(option?.text);
            }}
            caretDownButtonStyles={{ rootDisabled: { display: "none" } }}

            onRenderLowerContent={allowCreate ? () =>
                <div style={({
                    position: "fixed",
                    backgroundColor: theme?.palette.white,
                    boxSizing: "border-box",
                    width: "100%",
                    boxShadow: `rgb(0 0 0 / 13%) 0px 3.2px 7.2px 0px, rgb(0 0 0 / 11%) 0px 0.6px 1.8px 0px`
                })}>
                    <Stack style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <CommandButton id={`${targetEntityName}_${logicalName}_new`} text={localization.new} styles={commandback} iconProps={emojiIcon}
                            onClick={(e) => _showModal()} />
                        <CommandButton text={localization.clear} styles={commandback} iconProps={emojiIconClear}
                            onClick={resetValue} />
                    </Stack>
                </div> : undefined}
            selectedKey={selectedKey}
        />
    </>
    )
}


export function LookupControl<T>({
    entityName,
    attributeName,
    onChange,
    disabled,
    // value,
    formData,
    formName,
    readonly,
    fieldName,
    formContext,
    extraErrors,
    errorMessage
}: LookupControlProps<T>) {




    const app = useModelDrivenApp();
    const entityAttributes = app.getAttributes(entityName);

    const attribute = entityAttributes[attributeName];
    const logicalName = attribute.logicalName;
    const [{ selectedValue, value, id, formvalues }, { onChange: eavOnChange }] = useEAVForm(state => ({
        selectedValue: state.formValues[logicalName.slice(0, -2)],
        value: state.formValues[logicalName],
        id: state.formValues["id"],
        formvalues: state.formValues
    }), "LookupControl" + attributeName);



    const { formDefinition } = useFormHost();
    const column = formDefinition?.columns[fieldName];




    if (!(isLookup(attribute.type)))
        return <div>...</div>;


    if (isPolyLookup(attribute.type)) {
        const type = attribute.type;

        const defaultEntity = () => {

            if (type.inline) {
                const referencetype = Object.entries(entityAttributes).filter(isAttributeLookupEntry).filter(x => x[0] != attributeName && value && formvalues[x[1].logicalName] === value)?.[0]?.[1]?.type?.referenceType;

                return referencetype ?? type.referenceTypes[0];

            }


            return type.referenceTypes[0];
        }

        const [selectedEntity, setSelectedEntity] = useState(defaultEntity);

        console.log("Poly Lookup", [value]);

        return <Stack horizontal tokens={{ childrenGap:10 }}>

            <Dropdown styles={{ root: { width:150 } }} selectedKey={selectedEntity} onChange={(x, o) => setSelectedEntity(o?.data)} options={attribute.type.referenceTypes.map(c => ({ key: c, text: c, data: c }))} ></Dropdown>
            <Stack.Item grow>
                <LookupCoreControl
                    key={selectedEntity}
                    selectedValue={selectedValue}
                    onChange={eavOnChange}
                    value={value}
                    type={attribute.type}
                    //  forms={Object.keys(forms).filter(k => forms[k].type === "Modal")}
                    filter={column?.filter ?? attribute.type.filter}
                    allowCreate={column?.disableCreate !== true}
                    searchForLabel={column?.searchForLabel}
                    label={attribute.displayName}
                    extraErrors={extraErrors}
                    targetEntityName={selectedEntity}
                    logicalName={attribute.type.inline ? Object.entries(entityAttributes).filter(isAttributeLookupEntry).filter(x => x[1].type.referenceType === selectedEntity)[0][1].logicalName : attribute.logicalName}
                    disabled={disabled || readonly}
                />
            </Stack.Item>
        </Stack>
    }


    const targetEntityName = column.entityName ?? (isLookup(attribute.type) ? attribute.type.foreignKey?.principalTable! : throwIfNotDefined<string>(undefined, "Not a lookup attribute"));

    console.log("Lookup Control", [attributeName, attribute, fieldName, targetEntityName, formDefinition, attribute?.type, column, logicalName, selectedValue, value, formData]);

    //  
    const forms = isLookup(attribute.type) ? attribute.type?.forms ?? {} : {};

    console.log("filtering :", [column?.filter ?? attribute.type.filter]);



    return <LookupCoreControl
        selectedValue={selectedValue}
        onChange={eavOnChange}
        value={value}
        type={attribute.type}
        forms={Object.keys(forms).filter(k => forms[k].type === "Modal")}
        filter={column?.filter ?? attribute.type.filter}
        allowCreate={column?.disableCreate !== true}
        searchForLabel={column?.searchForLabel}
        label={attribute.displayName}
        extraErrors={extraErrors}
        targetEntityName={targetEntityName}
        logicalName={attribute.logicalName}
        disabled={disabled || readonly}
    />
}


export default LookupControl;

