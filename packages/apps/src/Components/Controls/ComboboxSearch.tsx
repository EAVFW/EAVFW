import { useModelDrivenApp } from "@eavfw/apps";
import { EntityDefinition, IRecord, queryEntity } from "@eavfw/manifest";
import { IComboBoxOption, IDropdownOption, ISearchBox, SearchBox } from "@fluentui/react";
import React, { useEffect } from "react";



export type ComboBoxSearchProps = {
    setOptions: (options: IComboBoxOption[]) => void,
    entityDefinition: EntityDefinition,
}

export function ComboBoxSearch(props: ComboBoxSearchProps) {
    const { setOptions, entityDefinition } = props;

    const ref = React.useRef<ISearchBox>(null);
    const app = useModelDrivenApp();

    const placeHolder = `${app.getLocalization('searchFor') ?? 'Search for'} ${entityDefinition.locale?.[app.locale].displayName ?? entityDefinition.displayName}`;
    const noResultText = app.getLocalization('noResults') ?? 'No results...';
    const loadingText = app.getLocalization('loading') ?? 'Loading...';

    const primaryField = Object.values(entityDefinition.attributes).filter(a => a.isPrimaryField)[0].logicalName;

    const _updateOptions = (query: any) => {
        setOptions([{ key: 'dummy', text: loadingText, disabled: true }])
        queryEntity(app.getEntity(entityDefinition.logicalName), query).then(results => {
            let options = results.items.map((record: IRecord): IComboBoxOption => {
                return {
                    key: record.id,
                    text: record[primaryField] ?? "No name"
                }
            }
            )
            if (options.length === 0) {
                setOptions([{ key: 'dummy', text: noResultText, disabled: true }])
            } else {
                setOptions(options);
            }
        });
    }

    const _onChange = async (
        event?: string,
        option?: IDropdownOption | IComboBoxOption,
        index?: number) => {
        console.log("BigDropDown", [event, typeof event, option, index]);

        // setSearchTerm(event);

        let query: any = { "$top": 10 };
        if (event) {
            query['$filter'] = `contains(${primaryField}, \'${event}\')`
        }

        _updateOptions(query);
    };

    useEffect(() => {
        _updateOptions({ "$top": 10 });
    }, [])

    return (
        <>
            <SearchBox
                placeholder={placeHolder}
                onSearch={_onChange}
                onClick={() => {
                    ref.current?.focus();
                }}
                onClear={() => {
                    _updateOptions({ "$top": 10 })
                }}
                componentRef={ref}
            />
        </>
    )
}
