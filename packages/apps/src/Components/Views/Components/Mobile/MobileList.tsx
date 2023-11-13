import React, { useEffect, useMemo, useState } from 'react';
import { useSelectionContext } from '../../../Selection/useSelectionContext';
import styles from './Card.module.css';
import { useAppInfo } from "../../../../index";
import { useModelDrivenApp } from "../../../../index";
import { MobileCard } from './MobileCard';
import { loiMockData } from './mockData';
import { EntityDefinition, IRecord } from '@eavfw/manifest';
import { Selection } from '@fluentui/react';
import { usePaging } from "./../../PagingContext";
import { DefaultDataCountQuery, DefaultDataQuery, ModelDrivenGridViewerState } from '../../ModelDrivenGridViewer';
import { useLazyMemo } from '@eavfw/hooks';
import { ICommandBarItemProps, IObjectWithKey } from '@fluentui/react';


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
    onItemInvoked: (item: any) => void
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
        entityName,
        locale,
        viewName,
        showViewSelector,
        formData,
        defaultValues,
        newRecord,
        rightCommands,
        commands,
        onItemInvoked,
        onQueueData = DefaultDataQuery,
        onQueryDataCount = DefaultDataCountQuery,
        recordRouteGenerator
    }
) => {

    const { selection, selectionDetails } = useSelectionContext();
    const { currentEntityName, currentAppName, currentAreaName, currentRecordId, title } = useAppInfo();
    const app = useModelDrivenApp();

    const _onItemInvoked = (item: IRecord): void => {
        window.location.href = recordRouteGenerator(item);
    };

    const appinfo = useAppInfo();
    console.log("GridView: " + locale);

    const [items, setItems] = useState<IRecord[]>(
        newRecord ? formData[entity.collectionSchemaName.toLowerCase()] ?? [] : []
    );
    const selectedView = useMemo(
        () => viewName ?? Object.keys(entity.views ?? {})[0],
        [viewName]
    );
    const attributes = useMemo(
        () => ({
            ...((entity.TPT && app.getEntity(entity.TPT).attributes) ?? {}),
            ...entity.attributes,
        }),
        [entityName]
    );

    const stateCommands = useLazyMemo<ModelDrivenGridViewerState["commands"]>(
        () => commands?.({ selection }) ?? rightCommands ?? [],
        [
            commands,
            selection,
            selectionDetails,
            appinfo.currentEntityName,
            appinfo.currentRecordId,
        ]
    );
    const {
        fetchQuery,
        setFetchQuery,
        pageSize,
        currentPage,
        setTotalRecords,
        enabled: pagingContextEnabled,
    } = usePaging();

    // console.log("Render FetchQuery", [viewDefinition, fetchQuery]);
    // if (fetchQuery) {
    //     fetchQuery["$count"] = false;
    // }
    const { data, isError, isLoading, mutate } = onQueueData(
        entity,
        newRecord,
        fetchQuery,

    );
    const { data: count } = onQueryDataCount(
        entity,
        newRecord,
        fetchQuery
    );

    //Set items whenever its done loading and augment with entityName.
    useEffect(() => {
        console.log("setItems from data", [
            data,
            isLoading,
            defaultValues,
            fetchQuery,
        ]);

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

    console.log("Displaying <MobileListComponent />", items);

    return (
        <div className={className} key={"MobileListComponent"}>
            <ul className={styles.list} >
                {
                    typeof items !== "undefined" &&
                        items.length > 0 ?
                        items.map((item, index) => (
                            <MobileCard
                                className={styles.listItem}
                                key={"MobileListItem" + index + item.key}
                                handleItemClicked={_onItemInvoked}
                                item={item}
                            />
                        ))
                        :
                        <p>No items to display.</p>
                }
            </ul>
        </div>
    );
};

import { RegistereView } from '../../ViewRegister';
RegistereView("mobile", MobileList);