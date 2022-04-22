import React, { useMemo, useState } from "react";

import {
    Stack,
    IDropdownOption,
    IPivotProps,
} from "@fluentui/react";
 
 
import { EntityDefinition, IRecord } from "@eavfw/manifest";
import { ModelDrivenBodyViewerProps } from "./ModelDrivenBodyViewerProps";
import { useUserProfile } from "../Profile/useUserProfile";
import { useRibbon } from "../Ribbon/useRibbon";
import { filterRoles } from "../../filterRoles";
import { useModelDrivenApp } from "../../useModelDrivenApp";
import { Views } from "../Views/ViewRegister";
import ModelDrivenGridViewer from "../Views/ModelDrivenGridViewer";
import ViewSelectorComponent from "./ViewSelectorComponent";








export function ModelDrivenBodyViewer
    (
        {
            locale,
            viewName,
            entity,
            entityName,
            recordRouteGenerator,
            showViewSelector = true,
        }: ModelDrivenBodyViewerProps) {


    const user = useUserProfile();
    const { } = useRibbon();

    const views = Object.fromEntries(Object.entries(
        entity.views ?? {}
    ).filter(([viewKey, view]) => filterRoles(view?.roles, user)));
    console.log("views:\n", views);

    const [selectedView, setselectedView] = useState(viewName ?? Object.keys(views)[0]);
    const hasMoreViews = Object.keys(views).length > 1;
    const data = [recordRouteGenerator, entityName, entity, selectedView, locale];

    const app = useModelDrivenApp();



    const BodyViewElement = useMemo(() => {

       
        if (entityName !== undefined && selectedView !== undefined) {
            const view = app.getEntity(entityName).views?.[selectedView];

            if (view !== undefined && view.type !== undefined) {
                if (view.type in Views) {
                    const CustomView = Views[view.type];
                    return <CustomView view={view} entity={entity} recordRouteGenerator={recordRouteGenerator}
                        key={entityName}
                        entityName={entityName}
                        viewName={selectedView}
                        locale={locale} />
                }
            }
        }

        return <ModelDrivenGridViewer
            recordRouteGenerator={recordRouteGenerator}
            key={entityName}
            entityName={entityName}
            entity={entity}
            viewName={selectedView}
            locale={locale} />;

    }, [entityName, selectedView]);

    const _onChangeView = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
        setselectedView(option?.key as string);
    }

    console.log("Model Driven View:", [showViewSelector, hasMoreViews]);
    return (
        <Stack verticalFill>
            {showViewSelector && hasMoreViews &&
                <ViewSelectorComponent
                    onChangeView={_onChangeView}
                    selectedView={selectedView}
                    entity={entity}
                    styles={{ root: { padding: 0 } }}
                />
            }
            <Stack.Item grow>
                {BodyViewElement}
            </Stack.Item>
        </Stack>
    )
}

export default ModelDrivenBodyViewer
