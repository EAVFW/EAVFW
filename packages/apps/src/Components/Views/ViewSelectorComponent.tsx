
import { EntityDefinition, ViewDefinition } from "@eavfw/manifest";
import {
    Dropdown,
    IDropdownOption,
    IDropdownStyleProps,
    IDropdownStyles,
    IStyleFunction,
    IStyle,
} from "@fluentui/react";
import React from "react";
import { filterRoles } from "../../filterRoles";
import { useUserProfile } from "../Profile/useUserProfile";



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
    console.log("views:\n", views);

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
        root: { root: { padding: 20 } },
        dropdown: { width: 240 },
        ...styles,
    });

    console.log(
        "styles with <neutralTertiaryAlt> set to <#c2bebc>:\n",
        // @ts-ignore
        _styles({ theme: { palette: { neutralTertiaryAlt: "#c2bebc" } } })
    );

    console.groupEnd();
    return (
        <Dropdown
            ariaLabel={ariaLabel}
            styles={_styles}
            onChange={onChangeView}
            options={views}
            selectedKey={selectedView}
        />
    );
};
export default ViewSelectorComponent;
