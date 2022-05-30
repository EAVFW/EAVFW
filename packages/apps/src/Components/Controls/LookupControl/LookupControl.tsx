import {
    ComboBox,
    CommandBar,
    CommandButton,
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
    useTheme
} from "@fluentui/react";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EntityDefinition, getRecordSWR, IRecord, isLookup, LookupType, NestedType, queryEntity, queryEntitySWR, TypeFormModalDefinition } from "@eavfw/manifest";
import { capitalize, throwIfNotDefined } from "@eavfw/utils";
import { LookupControlProps } from "./LookupControlProps";
import { FormRender } from "../../Forms/FormRender";
import { FormValidation } from "../../Forms/FormValidation";
import { useModelDrivenApp } from "../../../useModelDrivenApp";
import { useEAVForm } from "@eavfw/forms";
import { EAVFOrmOnChangeHandler } from "../../../../../forms/src/EAVFormContextActions";
import { useFormHost } from "../../Forms/ModelDrivenEntityViewer";
import { useAsyncMemo } from "../../../../../hooks/src";




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
    selectedValue:any,
    value: any,
    onChange: EAVFOrmOnChangeHandler<any>
}
function nullIfEmpty<T>(items: T[]) {

    if (items)
        return items.length ? items : null;

    return null;
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
    onChange
}) => {

    const ref = useRef<IComboBox>(null);

    const app = useModelDrivenApp();
    const theme = useTheme();

    const [modalOpen, setmodalOpen] = useState(false);
    const _hideModal = () => setmodalOpen(false);
    const _showModal = () => setmodalOpen(true);

    const localization = {
        new: capitalize(app.getLocalization("new") ?? "New"),
    };

    const targetEntity = app.getEntity(targetEntityName) as EntityDefinition;
    const primaryField = app.getPrimaryField(targetEntityName);



    const [hasFilterChanged, setHasFilterChanged] = useState(false);
    const hasFilterChangedFirst = useRef(false);
   


    const initialOptions = useMemo(() => (typeof (selectedValue) === "object" ? [{ key: selectedValue.id ?? DUMMY_DATA_KEY, text: selectedValue[primaryField] }] : []), [selectedValue]);

    const [shouldLoadRemoteOptions, setShouldLoadRemoteOptions] = useState(false);
    const [searchfilter, setSearchFilter] = useState<string>()
    const query = useMemo(() => ({ "$select": `id,${primaryField}`, "$top": 10, ...filter ? { '$filter': searchfilter ? `${searchfilter} and ${filter}` : filter } : {} }), [filter]);
    const { data: remoteItems = { items: [] as Array<IRecord> }, isLoading: isLoadingRemoteData } = queryEntitySWR(targetEntity, query, shouldLoadRemoteOptions || typeof (searchfilter) === "string");

    const loadRemoteValue = useMemo(() => !!value && typeof (selectedValue) === "undefined" && (!shouldLoadRemoteOptions || !isLoadingRemoteData) && remoteItems?.items.filter(x => x.id === value).length === 0, [selectedValue, isLoadingRemoteData, remoteItems?.items]);
    const { record: remoteSelectedValue, isLoading: isLoadingRemoteSelectedValue } = getRecordSWR(app.getEntity(targetEntityName).collectionSchemaName, value, `?$select=id,${primaryField}`, loadRemoteValue);


    const remoteOptions = useMemo(() => (remoteItems?.items.filter(c => c.id !== remoteSelectedValue?.id).map(m => ({
            key: m.id,
            text: m[primaryField],
        data: m.id
    })) as IComboBoxOption[] ?? []).concat(remoteSelectedValue?.id ?
        [{ key: remoteSelectedValue.id, text: remoteSelectedValue[primaryField] }]:[]), [remoteItems?.items, remoteSelectedValue]);

   

    const [selectedKey, setSelectedKey] = useState<string | null>(value ?? (typeof (selectedValue) === "object" ? selectedValue.id ?? DUMMY_DATA_KEY : undefined));

    const isLoading = useMemo(() => shouldLoadRemoteOptions && isLoadingRemoteData, [shouldLoadRemoteOptions, isLoadingRemoteData]);

    const localOptions = useRef<IDropdownOption[]>([]);

    const [dummyData, setDummyData] = useState<any>();

    const options = useMemo(() => (hasFilterChanged ? remoteOptions: remoteOptions.concat(localOptions.current).concat(initialOptions.filter(io => remoteOptions.filter(ro => ro.key === io.key).length === 0))),
        [initialOptions, remoteOptions, dummyData, hasFilterChanged]);


    useEffect(() => {
        if (hasFilterChangedFirst.current) {
            setHasFilterChanged(true);
            setSelectedKey(null);
        }
        hasFilterChangedFirst.current = true;
    }, [filter]);

    /**
     * When a modal is submittet, it has changed the raw object data, but not persisted to database. 
     * Modals change data inline and first saved to db as part of triggering save data.
     * @param data
     */
    const _onModalSubmit = useCallback((data: any) => {

        let o = localOptions.current;
        if (o.filter(o => o.key === DUMMY_DATA_KEY).length === 0)
            o.unshift({
                key: DUMMY_DATA_KEY,
                text: data[primaryField]
            });
        else
            o.filter(o => o.key === DUMMY_DATA_KEY)[0].text = data[primaryField];

       // setOptions(o);
        setSelectedKey("dummy");
        setDummyData(data);

        onChange(props => {
            props[logicalName.slice(0, -2)] = data
        });

    }, []);


    /**
     * The callback for dropdown onchange event
     * */
    const _onChange = useCallback((
        event: React.FormEvent<IComboBox>,
        option?: IDropdownOption | IComboBoxOption,
        index?: number) => {
         
        console.log("LookupControl: on change", [event, option,index]);
        onChange(props => {
            if (option?.key === "dummy") {
                delete props[logicalName];
                props[logicalName.slice(0, -2)] = dummyData
            } else {
                props[logicalName] = option?.data; //The id of selected value, but if key is dummy we picked the placeholder data
                delete props[logicalName.slice(0, -2)]; //Proper clean up by deleting the object part unless key is dummy placeholder
            }
            });
       
    }, [dummyData]);


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
     
    const placeHolder = `${app.getLocalization('searchFor') ?? 'Search for'} ${targetEntity.locale?.[app.locale]?.displayName ?? targetEntity.displayName}`;
    const noResultText = app.getLocalization('noResults') ?? 'No results...';
    const loadingText = app.getLocalization('loading') ?? 'Loading...';
    const [freeformvalue, setfreeformvalue] = useState<string>();

  

  //  const [isLoading, setisLoading] = useState(true);

    //const __updateOptions = (query: any) => {

    //    setOptions([{ key: 'dummy', text: loadingText, disabled: true }])
    //    queryEntity(targetEntity, query).then(results => {

    //        console.log("LookupControl: Loading additional data", [value, targetEntity.logicalName,results]);

    //        let options = results.items.map((record: IRecord): IComboBoxOption => {
    //            return {
    //                key: record.id,
    //                data: record.id,
    //                text: record[primaryField] ?? "No name"
    //            }
    //        }
    //        )
    //        if (options.length === 0) {
    //            setOptions([{ key: 'dummy', text: noResultText, disabled: true }])
    //        } else {
    //            setOptions(options);
    //        }
    //    });
    //}

    //const isFilterChanged = useRef(false);
    //useEffect(() => {
    //    if (isFilterChanged.current) {
    //        //onChange(props => {
    //        //    delete props[logicalName];
    //        //});
    //        setfreeformvalue(undefined);

    //        setOptions((typeof (selectedValue) === "object" ? [{ key: selectedValue.id ?? "dummy", text: selectedValue[primaryField] }] : []));
    //        setselectedKey(value ?? (typeof (selectedValue) === "object" ? selectedValue.id ?? "dummy" : undefined) as string);
    //        setisLoading(true);
             
    //    }

    //    isFilterChanged.current = true;
    //}, [filter]);

    //TODO, redesign all this options stuff to not use query entity, but require everything to change. filtering.
    //useEffect(() => {


    //    (async () => {
    //        if (isLoading && !disabled) {
               
    //                let data = await queryEntity(targetEntity, filter ? { '$filter': filter, "$top": 10 } : {});
    //                console.log("LookupControl: Loading initial data", [value, targetEntity.logicalName, data]);
    //                const _options = data.items
    //                    .map(m => ({
    //                        key: m.id,
    //                        text: m[primaryField],
    //                        data: m.id
    //                    })) as IComboBoxOption[];
    //            setisLoading(false);
               
    //            setOptions(_options.concat(options.filter(o => _options.filter(oo => oo.key === o.key).length === 0)));


               

    //        }
    //    })()

    //}, [value, disabled, filter, isLoading])

    console.log("Lookup Control:", [label, disabled, isLoading, remoteItems, initialOptions, remoteOptions, options, filter, hasFilterChanged, value, selectedValue, selectedKey, loadRemoteValue,
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
                <FormRender forms={modalForms} type={type} dismissPanel={_hideModal}
                    onChange={_onModalSubmit} extraErrors={extraErrors} />
            </Stack>
        </Modal>

        <ComboBox
            componentRef={ref}
            disabled={disabled || isLoading}
            
            ariaLabel={label}
            styles={{ optionsContainerWrapper: { maxHeight: "25vh" }, inputDisabled: { background: theme?.palette.neutralLight }, rootDisabled: { borderWidth: 1, borderStyle: "solid", borderColor: theme?.palette.black, background: theme?.palette.neutralLight } }}
            onChange={_onChange}
            
            options={options}
            useComboBoxAsMenuWidth
            allowFreeform={false}
            text={freeformvalue}
            autofill={{
                onInputValueChange: (value) => {
                   
                    console.log(value); ref.current?.focus(true);
                    setfreeformvalue(value);
                    setSearchFilter(`contains(${primaryField}, \'${value}\')`)
                     


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
                    <CommandButton text={localization.new} styles={commandback} iconProps={emojiIcon}
                        onClick={(e) => _showModal()} />
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
    const [{ selectedValue, value, id }, { onChange: eavOnChange }] = useEAVForm(state => ({
        selectedValue: state.formValues[logicalName.slice(0, -2)],
        value: state.formValues[logicalName],
        id: state.formValues["id"]
    }))

    
    
    const { formDefinition } = useFormHost();
    const column = formDefinition?.columns[fieldName];

    

    console.log("Lookup Control", [attributeName, attribute, attribute?.type, column]);

    if (!isLookup(attribute.type))
        return <div>...</div>;

    const targetEntityName = isLookup(attribute.type) ? attribute.type.foreignKey?.principalTable! : throwIfNotDefined<string>(undefined, "Not a lookup attribute");

 //  
    const forms = isLookup(attribute.type) ? attribute.type?.forms ?? {} : {};
    
    console.log("filtering :", [column?.filter ?? attribute.type.filter])
     
    return <LookupCoreControl
        selectedValue={selectedValue}
        onChange={eavOnChange}
        value={value}
        type={attribute.type}
        forms={Object.keys(forms).filter(k => forms[k].type === "Modal")}
        filter={column?.filter ?? attribute.type.filter}
        allowCreate={column?.disableCreate !== true }
        label={attribute.displayName}
        extraErrors={extraErrors}
        targetEntityName={targetEntityName}
        logicalName={attribute.logicalName}
        disabled={disabled || readonly}
    />
}


export default LookupControl;

