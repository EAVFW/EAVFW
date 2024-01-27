import React, { useEffect, useMemo, useState } from 'react';
import { useSelectionContext } from '../../../Selection/useSelectionContext';
import styles from './Card.module.css';
import { useAppInfo, useModelDrivenApp } from "../../../../index";
import { MobileCard } from './MobileCard';
import { EntityDefinition, IRecord } from '@eavfw/manifest';
import { Selection } from '@fluentui/react';
import { usePaging } from "./../../PagingContext";
import { DefaultDataCountQuery, DefaultDataQuery } from '../../ModelDrivenGridViewer';
import { ICommandBarItemProps, IObjectWithKey } from '@fluentui/react';
import { CardObject, ItemToCardResolver } from './ItemToCardResolver';
import { useRibbon } from '../../../Ribbon/useRibbon';
import { ModelDrivenViewContextProvider } from '../../ModelDrivenViewContext';

//trigger build

export type MobileListProps = {
    className?: string;
    newRecord?: boolean;
    entity: EntityDefinition;
    entityName?: string;
    locale: string;
    viewName?: string;
    showViewSelector?: boolean;
    formData?: any;
    defaultValues?: Array<any>;
    recordRouteGenerator: (record: IRecord) => string;
    onQueueData?: typeof DefaultDataQuery;
    onQueryDataCount?: typeof DefaultDataCountQuery;
    commands?: (ctx: {
        selection: Selection<Partial<IRecord> & IObjectWithKey>;
    }) => ICommandBarItemProps[];
    rightCommands?: ICommandBarItemProps[];
}

export const MobileList: React.FC<MobileListProps> = (
    {
        className,
        entity,
        viewName,
        formData,
        defaultValues,
        newRecord,
        onQueueData = DefaultDataQuery,
        recordRouteGenerator
    }
) => {
    const { buttons } = useRibbon();
    const { fetchQuery, setFetchQuery, currentPage, pageSize, enabled:pagingContextEnabled } = usePaging();
    const selectedView = useMemo(() => viewName ?? Object.keys(entity.views ?? {})[0], [viewName]);
    const [items, setItems] = useState<IRecord[]>(newRecord ? formData[entity.collectionSchemaName.toLowerCase()] ?? [] : []);
    const { selection } = useSelectionContext();
    const app = useModelDrivenApp();
    const { currentEntityName } = useAppInfo();
    const { data, isLoading, mutate } = onQueueData(entity, newRecord, fetchQuery);
    const view = useMemo(() => entity.views?.[selectedView] ?? {}, [selectedView]);

    const _onItemInvoked = (item: IRecord): void => {
        window.location.href = recordRouteGenerator(item);
    };

    //Set items whenever its done loading and augment with entityName.
    useEffect(() => {
        if (data)
            setItems(
                data.items.map((item) =>
                    Object.assign(item, { entityName: entity.logicalName })
                )
            );

        if (newRecord && defaultValues) {
            setItems(
                defaultValues.map((item) =>
                    Object.assign(item, { entityName: entity.logicalName })
                )
            );
        }
    }, [data, newRecord && defaultValues]);

    useEffect(() => {
        /* Letting selection know which items has been loaded. */
        if (data?.items)
            selection.setItems(data.items);
    }, [data?.items])

    const cardObjects = useMemo(() => ItemToCardResolver.convertItemsToCardObjects(items, selectedView, view.columns!, app, buttons, selection),[items]);
    const attributes = useMemo(() => app.getAttributes(currentEntityName), [currentEntityName]);

    return (
        <ModelDrivenViewContextProvider mutate={mutate}>
        <ColumnFilterProvider
            view={view}
            //   filter={filter}
            attributes={attributes}
            locale={app.locale}
         //   onHeaderRender={onHeaderRender}
            onBuildFetchQuery={q=>q}
            setFetchQuery={setFetchQuery}
            currentPage={currentPage}
            pageSize={pageSize}
            pagingContextEnabled={pagingContextEnabled}
            app={app}
        >
        <div className={className} key="MobileListComponent">
            <ul className={styles.list}>
                {
                    typeof cardObjects !== "undefined" && cardObjects.length > 0 ?
                        cardObjects.map((cardObject, index) => (
                            <li key={`MobileListItem-${index}`}>
                                <MobileCard
                                    className={styles.listItem}
                                    handleItemClicked={_onItemInvoked}
                                    item={cardObject}
                                />
                            </li >
                        ))
                        :
                        <li><p>No items to display.</p></li>
                }
            </ul>
            </div>
            </ColumnFilterProvider>
        </ModelDrivenViewContextProvider>
    );
};

import { RegistereView } from '../../ViewRegister';
import { ColumnFilterProvider } from '../../../ColumnFilter/ColumnFilterContext';
RegistereView("mobile", MobileList);