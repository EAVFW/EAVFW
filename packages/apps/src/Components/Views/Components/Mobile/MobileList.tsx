import React from 'react';
import { useSelectionContext } from '../../../Selection/useSelectionContext';
import styles from './Card.module.css';
import { useAppInfo } from "../../../../index";
import { useModelDrivenApp } from "../../../../index";
import { MobileCard } from './MobileCard';
import { loiMockData } from './mockData';
import { EntityDefinition, IRecord } from '@eavfw/manifest';


export type MobileListProps = {
    className?: string
    items: any[]
    entity: EntityDefinition;
    entityName?: string;
    locale: string;
    viewName?: string;
    showViewSelector?: boolean;
    recordRouteGenerator: (record: IRecord) => string;
    onItemInvoked: (item: any) => void
    onQueueData?: typeof DefaultDataQuery;
    onQueryDataCount?: typeof DefaultDataCountQuery;

}

export const MobileList: React.FC<MobileListProps> = (
    {
        className,
        items = loiMockData,
        entity,
        entityName,
        locale,
        viewName,
        showViewSelector,
        onItemInvoked,
        onQueueData = DefaultDataQuery,
        onQueryDataCount = DefaultDataCountQuery
    }
) => {

    const { selection } = useSelectionContext();
    const { currentEntityName, currentAppName, currentAreaName, currentRecordId, title } = useAppInfo();
    const app = useModelDrivenApp();

    const handleItemClick = (item: any) => {
        onItemInvoked(item);
    };

    // const { data, isError, isLoading, mutate } = onQueueData(
    //     entity,
    //     newRecord,
    //     fetchQuery,

    // );
    // const { data: count } = onQueryDataCount(
    //     entity,
    //     newRecord,
    //     fetchQuery
    // );

    // useEffect(() => {
    //     mutate();
    // }, [formData?.modifiedon]);

    console.log("Displaying <MobileListComponent />", items);

    return (
        <div className={className} key={"MobileListComponent"}>
            <ul className={styles.list} >
                {items.map((item, index) => (
                    <MobileCard
                        className={styles.listItem}
                        key={"MobileListItem" + index + item.key}
                        handleItemClicked={handleItemClick}
                        item={item}
                        index={index} />
                ))}
            </ul>
        </div>
    );
};

import { RegistereView } from '../../ViewRegister';
import { DefaultDataCountQuery, DefaultDataQuery } from '../../ModelDrivenGridViewer';
RegistereView("mobile", MobileList);