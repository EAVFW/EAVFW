import React, { useEffect, useMemo, useState } from "react";
import {
    Stack,
    IDropdownOption,
} from "@fluentui/react";
import { ModelDrivenBodyViewerProps } from "./ModelDrivenBodyViewerProps";
import { useUserProfile } from "../Profile/useUserProfile";
import { useRibbon } from "../Ribbon/useRibbon";
import { filterRoles } from "../../filterRoles";
import { useModelDrivenApp } from "../../useModelDrivenApp";
import { Views } from "../Views/ViewRegister";
import ModelDrivenGridViewer from "./ModelDrivenGridViewer/ModelDrivenGridViewer";
import ViewSelectorComponent from "./ViewSelectorComponent";
import { RibbonHost } from "../Ribbon/RibbonHost";
import { PagingProvider } from "./PagingContext";
import { isMobileDevice } from "@eavfw/utils/src/isMobileDevice";
import { MobileList } from "./Mobile/MobileList";

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

    const [isMobile, setIsMobile] = useState(isMobileDevice());

    /* Handles when screen-size is modified */
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(isMobileDevice());
        };
        if (typeof window !== "undefined" && window) {
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    const views = Object.fromEntries(Object.entries(
        entity.views ?? {}
    ).filter(([viewKey, view]) => filterRoles(view?.roles, user)));
    console.log("views:\n", views);

    const [selectedView, setselectedView] = useState(viewName ?? Object.keys(views)[0]);
    const hasMoreViews = Object.keys(views).length > 1;
    //  const data = [recordRouteGenerator, entityName, entity, selectedView, locale];

    const app = useModelDrivenApp();

    const BodyViewElement = useMemo(() => {

        if (entityName !== undefined && selectedView !== undefined) {
            console.log("#######KBA - entityName: ", entityName, "selectedView: ", selectedView);
            const view = app.getEntity(entityName).views?.[selectedView];

            if (view !== undefined && view.type !== undefined) {
                console.log("#######KBA - view: ", view, "view.type: ", view.type, "Views: ", Views);
                if (view.type in Views) {
                    const CustomView = Views[view.type];
                    return <CustomView
                        view={view}
                        viewName={selectedView}
                        entity={entity}
                        entityName={entityName}
                        locale={locale}
                        recordRouteGenerator={recordRouteGenerator}
                    />
                }
            }
        }

        // if (isMobile) {
        //     return (
        //         <MobileList
        //             recordRouteGenerator={recordRouteGenerator}
        //             key={entityName}
        //             entityName={entityName}
        //             entity={entity}
        //             viewName={selectedView}
        //             locale={locale}


        //         />
        //     )
        // }

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
    const view = useMemo(() => entity.views?.[selectedView] ?? {}, [selectedView]);
    const ribboninfo = useMemo(() => entity.views?.[selectedView]?.ribbon ?? {}, [selectedView]);
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
                <Stack.Item grow style={{ height: "calc(100% - 32px)" }}>
                    <RibbonHost ribbon={ribboninfo}>
                        {BodyViewElement}
                    </RibbonHost>
                </Stack.Item>
            </Stack>
        </PagingProvider>
    )
}

export default ModelDrivenBodyViewer
