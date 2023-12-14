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
import { RibbonHost } from "../Ribbon/RibbonHost";
import { PagingProvider } from "./PagingContext";
import { useIsMobileDevice } from "@eavfw/utils";
import { MobileList } from "./Components/Mobile/MobileList";








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
  //  const data = [recordRouteGenerator, entityName, entity, selectedView, locale];

    const app = useModelDrivenApp();
    const isMobile = useIsMobileDevice();
    const view = useMemo(() => entity.views?.[selectedView] ?? {}, [selectedView]);

    const BodyViewElement = useMemo(() => {

        console.log("BodyViewerElement", [isMobile]);
       
        if (entityName !== undefined && selectedView !== undefined) {
             

            if (view !== undefined && view.type !== undefined) {
                if (view.type in Views) {
                    const CustomView = Views[view.type];
                    return <CustomView view={view} entity={entity} recordRouteGenerator={recordRouteGenerator}
                       
                        entityName={entityName}
                        viewName={selectedView}
                        locale={locale} />
                }
            }
        }

        //TODO - Move common elements from mobile list and modeldrivengridviewer into shared parent component

        if (isMobile && view.mobile) {
            return <MobileList entity={entity} recordRouteGenerator={recordRouteGenerator}

                entityName={entityName}
                viewName={selectedView}
                locale={locale} />
        }
        
        return <ModelDrivenGridViewer
            recordRouteGenerator={recordRouteGenerator}
            key={entityName}
            entityName={entityName}
            entity={entity}
            viewName={selectedView}
            locale={locale} />;

    }, [entityName, selectedView, isMobile, view]);

    const _onChangeView = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
        setselectedView(option?.key as string);
    }
   
    const ribboninfo = useMemo(() => entity.views?.[selectedView]?.ribbon ?? {}, [ selectedView]);
    console.log("Model Driven View:", [showViewSelector, hasMoreViews]);
    return (
        <PagingProvider initialPageSize={typeof (view?.paging) === "object" ? view.paging.pageSize ?? undefined : undefined} enabled={!(view?.paging === false || (typeof (view?.paging) === "object" && view?.paging?.enabled === false))} >
        <Stack verticalFill>
            {showViewSelector && hasMoreViews &&
                <ViewSelectorComponent
                    onChangeView={_onChangeView}
                    selectedView={selectedView}
                    entity={entity}
                    styles={{ root: { padding: 0 } }}
                />
                }
                <Stack.Item grow style={{height:"calc(100% - 32px)"}}>
                <RibbonHost ribbon={ribboninfo}>
                    {BodyViewElement}
                </RibbonHost>
            </Stack.Item>
            </Stack>
        </PagingProvider>
    )
}

export default ModelDrivenBodyViewer
