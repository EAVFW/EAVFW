import React, { useEffect, useMemo, useState } from 'react';
import { useSelectionContext } from '../../../Selection/useSelectionContext';
import styles from './Card.module.css';
import { useModelDrivenApp } from "../../../../index";
import { MobileCard } from './MobileCard';
import { EntityDefinition, IRecord } from '@eavfw/manifest';
import { Selection } from '@fluentui/react';
import { usePaging } from "./../../PagingContext";
import { DefaultDataCountQuery, DefaultDataQuery } from '../../ModelDrivenGridViewer';
import { ICommandBarItemProps, IObjectWithKey } from '@fluentui/react';
import { ItemToCardResolver } from './ItemToCardResolver';
import { useRibbon } from '../../../Ribbon/useRibbon';

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
    const { fetchQuery } = usePaging();
    const selectedView = useMemo(() => viewName ?? Object.keys(entity.views ?? {})[0], [viewName]);
    const [items, setItems] = useState<IRecord[]>(newRecord ? formData[entity.collectionSchemaName.toLowerCase()] ?? [] : []);
    const { selection } = useSelectionContext();
    const app = useModelDrivenApp();
    const { data, isLoading } = onQueueData(entity, newRecord, fetchQuery,);
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
        selection.setItems(data.items);
    }, [data])

    const cardObjects = ItemToCardResolver.convertItemsToCardObjects(items, view.columns!, app, buttons, selection);


    return (
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
    );
};

import { RegistereView } from '../../ViewRegister';
RegistereView("mobile", MobileList);