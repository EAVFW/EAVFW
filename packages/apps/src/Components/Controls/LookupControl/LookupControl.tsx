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

import React, { useEffect, useMemo, useRef, useState } from "react";

import { EntityDefinition, IRecord, isLookup, LookupType, NestedType, queryEntity, queryEntitySWR, TypeFormModalDefinition } from "@eavfw/manifest";
import { capitalize, throwIfNotDefined } from "@eavfw/utils";
import { LookupControlProps } from "./LookupControlProps";
import { FormRender } from "../../Forms/FormRender";
import { FormValidation } from "../../Forms/FormValidation";
import { useModelDrivenApp } from "../../../useModelDrivenApp";
import { useEAVForm } from "@eavfw/forms";
import { EAVFOrmOnChangeHandler } from "../../../../../forms/src/EAVFormContextActions";






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

    const [options, setOptions] = useState<IDropdownOption[]>((typeof (selectedValue) === "object" ? [{ key: selectedValue.id ?? "dummy", text: selectedValue[primaryField] }] : []));
    const [selectedKey, setselectedKey] = useState<string>(value ?? (typeof (selectedValue) === "object" ? selectedValue.id ?? "dummy" : undefined));

    const [modalForms, setModalForms] = useState(forms ?? []);

    const _onModalSubmit = (data: any) => {
         
            let o = options?.slice() ?? [];
            if (o.filter(o => o.key === "dummy").length === 0)
                o.unshift({
                    key: "dummy",
                    text: data[primaryField]
                });
            else
                o.filter(o => o.key === "dummy")[0].text = data[primaryField];

            setOptions(o);
            setselectedKey("dummy");


        onChange(props => {
            props[ logicalName.slice(0, -2)] = data
        });
       // onChange(data);
    }

    const _onChange = (
        event: React.FormEvent<IComboBox>,
        option?: IDropdownOption | IComboBoxOption,
        index?: number) => {
        try {
            console.log("lookup on change", event);

            // if (option?.data) {
            console.log(option?.data);
            onChange(props => {
                props[logicalName] = option?.data;

                
            });
            // }
        } finally {
            console.groupEnd();
        }
    }

    const placeHolder = `${app.getLocalization('searchFor') ?? 'Search for'} ${targetEntity.locale?.[app.locale]?.displayName ?? targetEntity.displayName}`;
    const noResultText = app.getLocalization('noResults') ?? 'No results...';
    const loadingText = app.getLocalization('loading') ?? 'Loading...';

    const [freeformvalue, setfreeformvalue] = useState<string>();

    useEffect(() => {

        let selectedKey = value;

        if (selectedKey && typeof selectedKey !== "object") {
            setselectedKey(selectedKey);
            //let text = options.filter(f => f.key === selectedKey)[0]?.text;

            //    setfreeformvalue(text);
        }
    }, [value]);

    const [isLoading, setisLoading] = useState(true);

    const _updateOptions = (query: any) => {
        setOptions([{ key: 'dummy', text: loadingText, disabled: true }])
        queryEntity(targetEntity, query).then(results => {

            console.log("LookupControl: Loading additional data", [value, targetEntity.logicalName,results]);

            let options = results.items.map((record: IRecord): IComboBoxOption => {
                return {
                    key: record.id,
                    data: record.id,
                    text: record[primaryField] ?? "No name"
                }
            }
            )
            if (options.length === 0) {
                setOptions([{ key: 'dummy', text: noResultText, disabled: true }])
            } else {
                setOptions(options);
            }
        });
    }

    
    useEffect(() => {


        (async () => {
            if (isLoading && !disabled) {
                 
                let data = await queryEntity(targetEntity, filter ? { '$filter': filter } : {});
                console.log("LookupControl: Loading initial data", [value, targetEntity.logicalName, data]);
                const _options = data.items
                    .map(m => ({
                        key: m.id,
                        text: m[primaryField],
                        data: m.id
                    })) as IComboBoxOption[];

                setOptions(_options.concat(options.filter(o => _options.filter(oo => oo.key === o.key).length === 0)));
                setisLoading(false);


            }
        })()

    }, [value, disabled])

    console.log("Lookup Control:", [label, disabled, isLoading, options, filter]);
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
                    let query: any = { "$top": 10 };
                    if (value) {
                        query['$filter'] = `contains(${primaryField}, \'${value}\')`
                    }

                    _updateOptions(query);



                }
            }}

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
    const [{ selectedValue, value }, { onChange:eavOnChange }] = useEAVForm(state => ({
        selectedValue: state.formValues[logicalName.slice(0, -2)],
        value: state.formValues[logicalName]
    }))


    const column = app.getEntity(entityName).forms?.[formName]?.columns[fieldName];


    console.log("Lookup Control", [attributeName, attribute, attribute?.type]);

    if (!isLookup(attribute.type))
        return <div>...</div>;

    const targetEntityName = isLookup(attribute.type) ? attribute.type.foreignKey?.principalTable! : throwIfNotDefined<string>(undefined, "Not a lookup attribute");

    const forms = isLookup(attribute.type) ? attribute.type?.forms ?? {} : {};
   
     
    const [schoolid] = useEAVForm((state) => state.formValues["schoolid"]);
    const isschool = isLookup(attribute.type) && ((column?.filter ?? attribute.type.filter)?.indexOf('@{lookup(\'schools\',formData()?.schoolid,\'$expand=schooltype\').schooltype.id}')??-1) !== -1;
    
    const { data: schoolFilter, isLoading } = queryEntitySWR(app.getEntity('school'), {
        '$expand': 'schooltype',
        '$filter': `id eq ${schoolid}`
    }, isschool && !!schoolid);

 

    const filter = useMemo(() => {
       
        if (isLookup(attribute.type)) {
            let _filter = (column?.filter ?? attribute.type.filter);
            //TODO - get this migrated out generic
            
            if (isschool && _filter) {

                if (schoolFilter)
                    return _filter.replace('@{lookup(\'schools\',formData()?.schoolid,\'$expand=schooltype\').schooltype.id}', schoolFilter.items[0].schooltype.id);
                return undefined;
            }

            return _filter;

           
        } 

    }, [attribute, schoolFilter])

    if (isschool && isLoading)
        return <div>...</div>;

    console.log("filtering :", [column?.filter ?? attribute.type.filter])

   
    
    return <LookupCoreControl
        selectedValue={selectedValue}
        onChange={eavOnChange}
        value={value}
        type={attribute.type}
        forms={Object.keys(forms).filter(k => forms[k].type === "Modal")}
        filter={filter}
        allowCreate={column?.disableCreate !== true }
        label={attribute.displayName}
        extraErrors={extraErrors}
        targetEntityName={targetEntityName}
        logicalName={attribute.logicalName}
        disabled={disabled || readonly}
    />
}


export default LookupControl;

