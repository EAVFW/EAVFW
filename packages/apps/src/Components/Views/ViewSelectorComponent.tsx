
import { EntityDefinition, ViewDefinition } from "@eavfw/manifest";
import {
 //   Dropdown,
    IDropdownOption,
    IDropdownStyleProps,
    IDropdownStyles,
    IStyleFunction,
    IStyle,
} from "@fluentui/react";
import React from "react";
import { filterRoles } from "../../filterRoles";
import { useUserProfile } from "../Profile/useUserProfile";
import { Dropdown, Option, Select } from "@fluentui/react-components";



export type IViewSelectorStyles = {
    root: IStyle;
};

export type ViewSelectorComponentProps = {
    onChangeView: (
        event: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption,
        index?: number
    ) => void;
    selectedView: string;
    entity: EntityDefinition;
    ariaLabel?: string;
    styles?: IViewSelectorStyles;
};




const ViewSelectorComponent: React.VFC<ViewSelectorComponentProps> = (
    props
) => {
   
    console.group("ViewSelectorComponent");
    console.log("props:\n", props);
    const {
        onChangeView,
        selectedView,
        entity,
        ariaLabel = "Views",
        styles,
    } = props;

    const user = useUserProfile();

    const views: IDropdownOption[] = Object.entries(
        entity.views ?? {}
    ).filter(([viewKey, view]) => filterRoles(view?.roles, user)).map(([viewKey, view]) => ({ key: viewKey, text: view.title ?? viewKey, data: view }));
     
    console.groupEnd();
    return (
        <Dropdown style={{ margin: "5px 5px 5px 25px", width: 240 }}
            aria-label={ariaLabel}

            onOptionSelect={(e, v) => { onChangeView(e as any, views.find(x => x.key === v.optionValue)); }}
            value={views.find(x => selectedView === x.key)?.text}
            selectedOptions={[selectedView]}
             
        >
            {views.map(v => (<Option key={v.key} value={v.key?.toString()} text={v.text}>{v.text}</Option>))}
        </Dropdown>
    );
};
export default ViewSelectorComponent;
