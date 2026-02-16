import { Dropdown, IDropdownOption, IDropdownProps } from '@fluentui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { JSONSchema7 } from 'json-schema';
import { useRef } from 'react';
import { AttributeDefinition, ChoicesType, IRecord, queryEntitySWR } from '@eavfw/manifest';
import { ChoicesControlProps } from './ChoicesControlProps';
import { useRibbon } from '../../Ribbon/useRibbon';
import { useModelDrivenApp } from '../../../useModelDrivenApp';
import { useAppInfo } from '../../../useAppInfo';

declare module 'json-schema' {
  export interface JSONSchema7 {
    enumNames?: string[];
  }
}

export const ChoicesControl = ({
  entityName,
  attributeName,
  value,
  required,
  readonly,
  disabled,
  onBlur,
  onFocus,
  schema,
  onChange,
  name,
  formContext,
  idSchema,
}: ChoicesControlProps) => {
  const app = useModelDrivenApp();
  const appInfo = useAppInfo();
  const entity = app.getEntity(entityName);
  const column = entity.attributes[attributeName];

  const items = schema.items as JSONSchema7;
  const choices = column.type as ChoicesType;
  const enumOptions = items.properties?.[choices.logicalName] as JSONSchema7;
  const changedItems = useRef<Record<number, { state: string; item: { id: string } }>>({});
  const [newOptions, setnewOptions] = useState<Array<IDropdownOption>>([]);

  const saveinfo = useRibbon();

  const dummy = useRef({
    data: { items: [] },
    mutate: () => {},
    isLoading: false,
  });
  const { data, mutate, isLoading } = appInfo.currentRecordId
    ? queryEntitySWR<IRecord>(app.getEntity(choices.logicalName), {
        $filter: `${entity.logicalName}id eq ${appInfo.currentRecordId}`,
      })
    : dummy.current;
  useEffect(() => {
    saveinfo.events.on('saveComplete', mutate);
    return () => {
      saveinfo.events.off('saveComplete', mutate);
    };
  }, []);
  const [selectedKeys, setselectedKeys] = useState<number[]>([]);

  useEffect(() => {
    if (data?.items) {
      setnewOptions(
        enumOptions.enum?.map((v, i) => ({
          key: v as number,
          text: (enumOptions.enumNames?.[i] ?? v ?? '').toString(),
          data: {
            state:
              data.items.filter((c) => c[choices.logicalName] === v).length === 0
                ? 'new'
                : 'existing',
            item: {
              [choices.logicalName]: v,
              id: data.items.filter((c) => c[choices.logicalName] === v)[0]?.id,
            },
          },
        })) ?? [],
      );
    }
  }, [data]);

  const { onFormDataChange, locale, formData } = formContext;

  const _onChange: IDropdownProps['onChange'] = (a1, item, a3) => {
    const value = item!.key as number;

    if (item!.selected && item?.data.state === 'new') {
      changedItems.current[value] = item?.data;
    } else if (!item!.selected && item?.data.state === 'new') {
      delete changedItems.current[value];
    } else if (!item!.selected) {
      changedItems.current[value] = item?.data;
      changedItems.current[value].state = 'deleted';
    } else {
    }

    let relatedItems = Object.fromEntries([
      [
        name,
        Object.keys(changedItems.current)
          .map(Number)
          .filter((itemId) => changedItems.current[itemId].state !== 'deleted')
          .map((itemId) => changedItems.current[itemId].item),
      ],
      [
        `${name}@deleted`,
        Object.keys(changedItems.current)
          .map(Number)
          .filter((itemId) => changedItems.current[itemId].state === 'deleted')
          .map((itemId) => changedItems.current[itemId].item.id),
      ],
    ]);
    setselectedKeys(
      item?.selected ? [value].concat(selectedKeys) : selectedKeys.filter((v) => v !== value),
    );
    onFormDataChange(relatedItems);
  };

  const _onBlur = useCallback(
    (e: React.FocusEvent<HTMLElement>) => onBlur(idSchema.$id, selectedKeys),
    [selectedKeys],
  );

  const _onFocus = useCallback(
    (e: React.FocusEvent<HTMLElement>) => onFocus?.(idSchema.$id, selectedKeys),
    [selectedKeys],
  );

  useEffect(() => {
    const fromFormData =
      formData[name]?.map((f: Record<string, unknown>) => f[choices.logicalName]) ?? [];
    const fromRemote = data?.items ?? []; //map(f => f[choices.logicalName]) ?? [];
    const fromRemoteFiltered = fromRemote
      .filter(
        (value) =>
          (formData[`${name}@deleted`]?.filter((id: string) => id === value.id)?.length ?? 0) === 0,
      )
      .map((f) => f[choices.logicalName]);

    const selectedKeys = fromFormData.concat(fromRemoteFiltered);

    setselectedKeys(selectedKeys);
  }, [formData, data]);

  return (
    <Dropdown
      multiSelect={true}
      selectedKeys={selectedKeys}
      // defaultSelectedKey={column.default as number}
      //  defaultSelectedKeys={selectedKeys}
      required={required}
      options={newOptions}
      disabled={isLoading || disabled || readonly}
      onChange={_onChange}
      onBlur={_onBlur}
      onFocus={_onFocus}
    />
  );
};

/** @deprecated Use named import: `import { ChoicesControl } from '...'` instead of default import */
export default ChoicesControl;
