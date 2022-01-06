
import { EntityDefinition } from "@eavfw/manifest";
import {
    Dropdown,
    IDropdownOption,
    IDropdownStyleProps,
    IDropdownStyles,
    IStyleFunction,
    IStyle,
} from "@fluentui/react";
import React from "react";

export type IFormSelectorStyles = {
    root: IStyle;
};

export type FormSelectorProps = {
    onChangeView: (
        event: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption,
        index?: number
    ) => void;
    selectedForm: string;
    entity: EntityDefinition;
    ariaLabel?: string;
    styles?: IFormSelectorStyles;
};

export  const FormSelectorComponent: React.VFC<FormSelectorProps> = (props) => {
    console.group("FormSelectorComponent");
    console.log("props:\n", props);
    const {
        onChangeView,
        selectedForm,
        entity,
        ariaLabel = "Forms",
        styles,
    } = props;

    const forms: IDropdownOption[] = Object.keys(
        entity.forms ?? {}
    ).map((v) => ({ key: v, text: v, data: v }));
    console.log("forms:\n", forms);

    const _styles: IStyleFunction<IDropdownStyleProps, IDropdownStyles> = (
        props
    ) => ({
        title: {
            border: 0,
            selectors: {
                ":hover": {
                    backgroundColor: props.theme?.palette.neutralTertiaryAlt,
                },
            },
        },
        root: { root: { padding: 0 } },
        dropdown: { width: 240 },
        ...styles,
    });

    console.groupEnd();
    return (
        <Dropdown
            ariaLabel={ariaLabel}
            styles={_styles}
            onChange={onChangeView}
            options={forms}
            selectedKey={selectedForm}
        />
    );
};
export default FormSelectorComponent;
