import { Dropdown, IDropdownOption, Stack } from '@fluentui/react';

import React, { useMemo, useState } from 'react';

import { IRecord, isLookup, isPolyLookup } from '@eavfw/manifest';
import { throwIfNotDefined } from '@eavfw/utils';
import { LookupControlProps } from './LookupControlProps';
import { useModelDrivenApp } from '../../../useModelDrivenApp';
import { useEAVForm } from '@eavfw/forms';
import { useFormHost } from '../../Forms/ModelDrivenEntityViewer';
import { isAttributeLookupEntry } from '../../ColumnFilter/ColumnFilterContext';

import { LookupCoreControl } from './LookupCoreControl';

/** Re-export LookupCoreControl and its props type for barrel compatibility */
export { LookupCoreControl } from './LookupCoreControl';
export type { LookupCoreControlProps } from './LookupCoreControl';

export function LookupControl<T>({
  entityName,
  attributeName,
  onChange,
  disabled,
  // value,
  formData,
  formName,
  readonly,
  fieldName,
  formContext,
  extraErrors,
  errorMessage,
}: LookupControlProps<T>) {
  const app = useModelDrivenApp();

  const entityAttributes = app.getAttributes(entityName);

  const attribute = entityAttributes[attributeName];
  const logicalName = attribute.logicalName;
  const [{ selectedValue, value, formvalues }, { onChange: eavOnChange }] = useEAVForm((state) => {
    let isSplit = isPolyLookup(attribute.type) && attribute.type.split;
    let selectedValue =
      isPolyLookup(attribute.type) && attribute.type.split
        ? attribute.type.referenceTypes
            .map(
              (referenceType) =>
                state.formValues[
                  `${entityName}${app.getEntityFromKey(referenceType).logicalName}references`
                ],
            )
            .flat()[0]
        : state.formValues[logicalName.slice(0, -2)];

    if (isSplit && selectedValue)
      selectedValue = (selectedValue as IRecord)[
        Object.entries(app.getEntity((selectedValue as IRecord)['$type'] as string).attributes)
          .filter(isAttributeLookupEntry)
          .find(([_, x]) => isLookup(x.type) && x.type.referenceType !== entityName)?.[1]
          .logicalName.slice(0, -2)!
      ];

    return {
      selectedValue: selectedValue,
      value:
        isPolyLookup(attribute.type) && attribute.type.split
          ? (attribute.type.referenceTypes
              .map((referenceType) =>
                (
                  state.formValues[
                    `${entityName}${app.getEntityFromKey(referenceType).logicalName}references`
                  ] as IRecord[] | undefined
                )?.map((x: IRecord) => x[app.getEntityFromKey(referenceType).logicalName + 'id']),
              )
              .flat()[0] ?? (state.formValues[logicalName] as string | undefined)?.split(':')[1])
          : state.formValues[logicalName],
      id: state.formValues['id'],
      formvalues: state.formValues,
    };
  }, 'LookupControl' + attributeName);

  const { formDefinition } = useFormHost();
  const column = formDefinition?.columns[fieldName];

  const attributeType = attribute.type;

  if (!isLookup(attributeType)) return <div>...</div>;

  const filter = useMemo(() => {
    // The filter can use clientside replacement of values using combination of liqued and odata language
    // {{record/practiceid}} - record will be the formvalues

    //Replace all {{record/..}} with formvalues
    let filter = column?.filter ?? attributeType.filter;
    if (filter) {
      Object.entries(formvalues).forEach(([key, value]) => {
        filter = filter!.replace(`{{record/${key}}}`, value?.toString() ?? '');
      });
    }
    return filter;
  }, [column?.filter ?? attributeType.filter, formvalues]);

  if (isPolyLookup(attribute.type)) {
    const type = attribute.type;

    const options = attribute.type.referenceTypes.map((c) => ({ key: c, text: c, data: c }));

    const defaultEntity = () => {
      if (type.split && selectedValue)
        return app.getEntityKey((selectedValue as IRecord)['$type'] as string);

      if (type.split && formvalues[logicalName]) {
        return app.getEntityKey((formvalues[logicalName] as string).split(':')[0]);
      }

      if (type.inline) {
        const referencetype = Object.entries(entityAttributes)
          .filter(isAttributeLookupEntry)
          .filter(
            (x) => x[0] != attributeName && value && formvalues[x[1].logicalName] === value,
          )?.[0]?.[1]?.type?.referenceType;

        return referencetype ?? type.referenceTypes[0];
      }

      return type.referenceTypes[0];
    };

    const [selectedEntity, setSelectedEntity] = useState(defaultEntity);

    return (
      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <Dropdown
          styles={{ root: { width: 150 } }}
          selectedKey={selectedEntity}
          onChange={(x, o) => setSelectedEntity(o?.data)}
          options={options}
        ></Dropdown>
        <Stack.Item grow>
          <LookupCoreControl
            key={selectedEntity}
            selectedValue={selectedValue}
            onChange={(cb) => {
              eavOnChange((props, ctx) => {
                cb(props, ctx);
                const value = props[attribute.logicalName];
                if (
                  isPolyLookup(attribute.type) &&
                  attribute.type.split &&
                  typeof value === 'string' &&
                  !value.startsWith(selectedEntity)
                ) {
                  let referenceTypeLogicalName = app.getEntityFromKey(selectedEntity).logicalName;

                  const existingRefs = props[
                    `${entityName}${referenceTypeLogicalName}references`
                  ] as IRecord[] | undefined;
                  props[`${entityName}${referenceTypeLogicalName}references`] = [
                    {
                      $type: referenceTypeLogicalName,
                      ...(existingRefs?.[0] ?? {}),
                      [referenceTypeLogicalName + 'id']: props[attribute.logicalName],
                    },
                  ];
                  delete props[attribute.logicalName];
                }
              });
            }}
            value={value}
            type={attribute.type}
            filter={filter}
            allowCreate={column?.disableCreate !== true}
            searchForLabel={column?.searchForLabel}
            label={attribute.displayName}
            extraErrors={extraErrors}
            targetEntityName={selectedEntity}
            logicalName={
              attribute.type.inline
                ? Object.entries(entityAttributes)
                    .filter(isAttributeLookupEntry)
                    .filter((x) => x[1].type.referenceType === selectedEntity)[0][1].logicalName
                : attribute.logicalName
            }
            disabled={disabled || readonly}
          />
        </Stack.Item>
      </Stack>
    );
  }

  const targetEntityName =
    column.entityName ??
    (isLookup(attribute.type)
      ? attribute.type.foreignKey?.principalTable!
      : throwIfNotDefined<string>(undefined, 'Not a lookup attribute'));

  //
  const forms = isLookup(attribute.type) ? (attribute.type?.forms ?? {}) : {};

  return (
    <LookupCoreControl
      selectedValue={selectedValue}
      onChange={eavOnChange}
      value={value}
      type={attributeType}
      forms={Object.keys(forms).filter((k) => forms[k].type === 'Modal')}
      filter={filter}
      allowCreate={column?.disableCreate !== true}
      searchForLabel={column?.searchForLabel}
      label={attribute.displayName}
      extraErrors={extraErrors}
      targetEntityName={targetEntityName}
      logicalName={attribute.logicalName}
      disabled={disabled || readonly}
    />
  );
}

/** @deprecated Use named import: `import { LookupControl } from '...'` instead of default import */
export default LookupControl;
