import {
  CommandButton,
  IComboBox,
  IComboBoxOption,
  Icon,
  IDropdownOption,
  Stack,
  useTheme,
} from '@fluentui/react';

import { Dialog, DialogSurface, Toolbar, ToolbarButton } from '@fluentui/react-components';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  EntityDefinition,
  getRecordSWR,
  IRecord,
  NestedType,
  queryEntitySWR,
} from '@eavfw/manifest';
import { capitalize } from '@eavfw/utils';
import { FormValidation } from '@rjsf/utils';
import { useModelDrivenApp } from '../../../useModelDrivenApp';
import {
  EAVFormOnChangeCallbackContext,
  EAVFOrmOnChangeHandler,
} from '../../../../../forms/src/EAVFormContextActions';
import { FormRender } from '../../Forms/FormRender';

import { Combobox, Option } from '@fluentui/react-components';
import type { ComboboxProps } from '@fluentui/react-components';

import { DUMMY_DATA_KEY, commandback, emojiIcon, returnQueryFilter } from './lookupUtils';

export type LookupCoreControlProps = {
  extraErrors: FormValidation;
  targetEntityName: string;
  logicalName: string;
  disabled?: boolean;
  label: string;
  errorMessage?: string;
  allowCreate?: boolean;
  filter?: string;
  forms?: string[];
  type: NestedType;
  selectedValue: unknown;
  value: unknown;
  onChange: EAVFOrmOnChangeHandler<Record<string, unknown>>;
  searchForLabel?: string;
};

export const LookupCoreControl = ({
  extraErrors,
  targetEntityName,
  logicalName,
  disabled,
  label,
  errorMessage,
  allowCreate,
  filter,
  forms,
  type,
  value,
  selectedValue,
  onChange,
  searchForLabel,
}: LookupCoreControlProps) => {
  const ref = useRef<IComboBox>(null);

  const app = useModelDrivenApp();
  const theme = useTheme();

  const [modalOpen, setmodalOpen] = useState(false);
  const _hideModal = () => setmodalOpen(false);
  const _showModal = () => setmodalOpen(true);

  const localization = {
    new: capitalize(app.getLocalization('new') ?? 'New'),
    clear: capitalize(app.getLocalization('clear') ?? 'Clear'),
  };

  const targetEntity = app.getEntity(targetEntityName) as EntityDefinition;
  const primaryField = app.getPrimaryField(targetEntityName);

  const [hasFilterChanged, setHasFilterChanged] = useState(false);
  const hasFilterChangedFirst = useRef(false);

  const initialOptions: IComboBoxOption[] = useMemo(
    () =>
      typeof selectedValue === 'object' && selectedValue !== null
        ? [
            {
              key: (selectedValue as IRecord).id ?? DUMMY_DATA_KEY,
              text: String((selectedValue as IRecord)[primaryField] ?? ''),
            },
          ]
        : [],
    [selectedValue],
  );

  const [shouldLoadRemoteOptions, setShouldLoadRemoteOptions] = useState(false);
  const [searchfilter, setSearchFilter] = useState<string>();
  const query = useMemo(
    () => ({
      $select: `id,${primaryField}`,
      $top: '10',
      ...returnQueryFilter(searchfilter, filter),
    }),
    [filter, searchfilter],
  );
  const { data: remoteItems = { items: [] as Array<IRecord> }, isLoading: isLoadingRemoteData } =
    queryEntitySWR(
      targetEntity,
      query,
      shouldLoadRemoteOptions || typeof searchfilter === 'string',
    );

  const loadRemoteValue = useMemo(
    () =>
      !!value &&
      typeof selectedValue === 'undefined' &&
      (!shouldLoadRemoteOptions || !isLoadingRemoteData) &&
      remoteItems?.items.filter((x) => x.id === value).length === 0,
    [selectedValue, isLoadingRemoteData, remoteItems?.items],
  );
  const { record: remoteSelectedValue, isLoading: isLoadingRemoteSelectedValue } = getRecordSWR(
    app.getEntity(targetEntityName).collectionSchemaName,
    value as string,
    `?$select=id,${primaryField}`,
    loadRemoteValue,
  );

  const remoteOptions = useMemo(
    () =>
      (
        (remoteItems?.items
          .filter((c) => c.id !== remoteSelectedValue?.id)
          .map((m) => ({
            key: m.id,
            text: m[primaryField],
            data: m.id,
          })) as IComboBoxOption[]) ?? []
      ).concat(
        remoteSelectedValue?.id
          ? [{ key: remoteSelectedValue.id, text: remoteSelectedValue[primaryField] as string }]
          : [],
      ),
    [remoteItems?.items, remoteSelectedValue],
  );

  const [selectedKey, setSelectedKey] = useState<string | null>(
    (value as string | null) ??
      (typeof selectedValue === 'object' && selectedValue !== null
        ? ((selectedValue as IRecord).id ?? DUMMY_DATA_KEY)
        : null),
  );

  const isLoading = useMemo(
    () => shouldLoadRemoteOptions && isLoadingRemoteData,
    [shouldLoadRemoteOptions, isLoadingRemoteData],
  );

  const localOptions = useRef<IDropdownOption[]>([]);

  const [dummyData, setDummyData] = useState<Record<string, unknown>>();
  const [shoudAutosave, setShoudAutosave] = useState<boolean>(false);

  const options = useMemo(
    () =>
      hasFilterChanged && shouldLoadRemoteOptions
        ? remoteOptions
        : remoteOptions
            .concat(localOptions.current)
            .concat(
              initialOptions.filter(
                (io) => remoteOptions.filter((ro) => ro.key === io.key).length === 0,
              ),
            ),
    [initialOptions, remoteOptions, dummyData, hasFilterChanged],
  );

  useEffect(() => {
    if (!disabled && !!filter) {
      if (hasFilterChangedFirst.current) {
        setHasFilterChanged(true);
        setSelectedKey(null);
      }
      hasFilterChangedFirst.current = true;
    }
  }, [disabled, filter]);

  /**
   * When a modal is submittet, it has changed the raw object data, but not persisted to database.
   * Modals change data inline and first saved to db as part of triggering save data.
   * @param data
   */
  const _onFormRenderDataChange = useCallback(
    (data: Record<string, unknown>, localctx?: EAVFormOnChangeCallbackContext) => {
      setDummyData(data);
      setShoudAutosave(localctx?.autoSave ?? false);
    },
    [],
  );

  const [freeformvalue, setfreeformvalue] = useState<string>();

  const __onChange: ComboboxProps['onChange'] = (event) => {
    const value = event.target.value.trim();

    setfreeformvalue(value);
    setSearchFilter(`contains(${primaryField}, \'${value}\')`);
  };

  const resetValue = () => {
    //reset data
    onChange((props) => {
      delete props[logicalName];
      props[logicalName.slice(0, -2)] = undefined;
    });
    //reset text and lookup value
    setfreeformvalue('');
    setSelectedKey(null);
  };

  const onOptionSelect: ComboboxProps['onOptionSelect'] = (event, data) => {
    const matchingOption = options.find((x) => x.key === data.optionValue);

    if (!matchingOption) {
      resetValue();
    } else {
      onChange((props) => {
        if (matchingOption?.key === 'dummy') {
          delete props[logicalName];
          props[logicalName.slice(0, -2)] = dummyData;
        } else {
          props[logicalName] = matchingOption?.data; //The id of selected value, but if key is dummy we picked the placeholder data
          delete props[logicalName.slice(0, -2)]; //Proper clean up by deleting the object part unless key is dummy placeholder
        }
      });
    }
  };

  /*
   * If the value changes, then find and set key; Value is ids;
   * */
  useEffect(() => {
    if (value && typeof value === 'string') {
      setSelectedKey(value);
    }
  }, [value]);

  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  return (
    <>
      <Dialog
        open={modalOpen}
        onOpenChange={(event, data) => {
          setmodalOpen(data.open);
        }}
        modalType="alert" // to prevent closing dialog on focus change
      >
        <DialogSurface aria-orientation="vertical" style={{ minWidth: '60vw', maxWidth: '90vw' }}>
          <Toolbar aria-label="Modal ribbon commands" style={{ justifyContent: 'flex-end' }}>
            <ToolbarButton
              icon={<Icon iconName="Cancel" />}
              aria-label="Close"
              onClick={_hideModal}
            />
          </Toolbar>
          <FormRender
            entityName={targetEntityName}
            forms={forms}
            type={type}
            dismissPanel={(event) => {
              if (event === 'cancel') {
                _hideModal();
              } else if (event === 'save') {
                onChange((props, ctx: EAVFormOnChangeCallbackContext) => {
                  props[logicalName.slice(0, -2)] = dummyData;

                  ctx.autoSave = shoudAutosave;
                });
                setSelectedKey(DUMMY_DATA_KEY);
                _hideModal();
              }
            }}
            record={dummyData}
            onChange={_onFormRenderDataChange}
            extraErrors={extraErrors}
          />
        </DialogSurface>
      </Dialog>
      <Combobox
        aria-label={label}
        disabled={disabled}
        aria-disabled={disabled}
        autoComplete="off"
        id={`${targetEntityName}_${logicalName}_combo`}
        freeform
        selectedOptions={selectedKey ? [selectedKey] : []}
        value={freeformvalue || options.find((x) => x.key === selectedKey)?.text || ''}
        onChange={__onChange}
        onFocus={() => {
          if (!shouldLoadRemoteOptions) {
            setShouldLoadRemoteOptions(true);
          }
        }}
        onOptionSelect={onOptionSelect}
        open={isComboboxOpen}
        onOpenChange={(event, data) => setIsComboboxOpen(data.open)}
        clearable
      >
        {options.map((option) => (
          <Option key={option.key} value={option.key as string} text={option.text}>
            {option.text}
          </Option>
        ))}
        <div
          style={{
            backgroundColor: theme?.palette.white,
            boxSizing: 'border-box',
            width: '100%',
            borderTop: '1px solid rgb(0 0 0 / 13%)',
          }}
        >
          <Stack style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <CommandButton
              id={`${targetEntityName}_${logicalName}_new`}
              text={localization.new}
              styles={commandback}
              iconProps={emojiIcon}
              onClick={(e) => {
                setIsComboboxOpen(false);
                _showModal();
              }}
            />
          </Stack>
        </div>
      </Combobox>
    </>
  );
};
