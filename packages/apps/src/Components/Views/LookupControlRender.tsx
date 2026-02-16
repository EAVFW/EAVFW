import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Stack, CommandBar, Modal, MessageBar, MessageBarType } from '@fluentui/react';
import { FormValidation } from '@rjsf/utils';
import { useBoolean } from '@fluentui/react-hooks';

import { IRecord } from '@eavfw/manifest';

import { useRibbon } from '../Ribbon/useRibbon';
import { errorMessageFactory, useMessageContext } from '../MessageArea/MessageContext';
import { useProgressBarContext } from '../ProgressBar/ProgressBarContext';
import { handleValidationErrors } from '../../Validation/handleValidationErrors';
import { LazyFormRender } from '../Forms/LazyFormRender';
import { useModelDrivenApp } from '../../useModelDrivenApp';

import { LookupControlRenderProps } from './gridViewerTypes';

/**
 * Renders a lookup attribute value as a clickable link that opens a modal
 * for inline editing of the referenced record.
 */
export const LookupControlRender = ({
  item,
  attribute,
  type,
  recordRouteGenerator,
  onChange,
}: LookupControlRenderProps) => {
  const [isOpen, { setFalse, setTrue }] = useBoolean(false);
  const save = useRibbon();
  const app = useModelDrivenApp();

  const recordRef = useRef<IRecord>(item[attribute.logicalName.slice(0, -2)] as IRecord);
  const _onDataChange = useCallback((data: Record<string, unknown>) => {
    recordRef.current = data as IRecord;
  }, []);

  const [extraErrors, setExtraErrors] = useState({} as FormValidation);
  const entitySaveMessageKey = 'entitySaved';
  const { addMessage, removeMessage } = useMessageContext();
  const { showIndeterminateProgressIndicator, hideProgressBar } = useProgressBarContext();

  const entity = app.getEntity(type.foreignKey?.principalTable!);
  const attributes = useMemo(
    () => ({
      ...((entity.TPT && app.getEntity(entity.TPT).attributes) ?? {}),
      ...entity.attributes,
    }),
    [entity.logicalName],
  );

  const _onModalDismiss = useCallback(async (data: string | Record<string, unknown>) => {
    setFalse();
    if (data === 'save') {
      showIndeterminateProgressIndicator();

      const plain = Object.fromEntries(
        Object.values(attributes).map((v) => [v.logicalName, recordRef.current[v.logicalName]]),
      );
      const rsp = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entity.collectionSchemaName}/records/${recordRef.current.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(plain),
          credentials: 'include',
        },
      );

      if (rsp.ok) {
        for (const k of Object.keys(plain)) {
          (item[attribute.logicalName.slice(0, -2)] as Record<string, unknown>)[k] = plain[k];
        }

        if (onChange) onChange(item);

        addMessage(entitySaveMessageKey, (props?: Record<string, unknown>) => (
          <MessageBar
            messageBarType={MessageBarType.success}
            {...props}
            onDismiss={() => removeMessage(entitySaveMessageKey)}
          >
            {app.getLocalization('entitySaved') ?? <>Entity have been saved!</>}
          </MessageBar>
        ));
      } else {
        const { errors, extraErrors } = await handleValidationErrors(rsp, app);

        setExtraErrors(extraErrors);

        addMessage(
          entitySaveMessageKey,
          errorMessageFactory(
            {
              key: entitySaveMessageKey,
              removeMessage: removeMessage,
              messages: errors,
            },
            app,
          ),
        );
      }

      hideProgressBar();
    }
  }, []);

  const _onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (save.canSave) {
      const _once = () => {
        save.events.off('saveComplete', _once);
        setTrue();
      };
      save.events.on('saveComplete', _once);
      save.events.emit('onSave');
    } else {
      setTrue();
    }
    return false;
  };

  return (
    <>
      <Modal isOpen={isOpen} onDismiss={setFalse} isBlocking={true}>
        <Stack verticalFill styles={{ root: { minWidth: '60vw', maxWidth: '90vw' } }}>
          <Stack horizontal>
            <Stack.Item grow>
              <CommandBar
                id="ModalRibbonBarCommands"
                items={[]}
                farItems={[
                  {
                    key: 'close',
                    ariaLabel: 'Info',
                    iconOnly: true,
                    iconProps: { iconName: 'Cancel' },
                    onClick: setFalse,
                  },
                ]}
                ariaLabel="Use left and right arrow keys to navigate between commands"
              />
            </Stack.Item>
          </Stack>

          <LazyFormRender
            extraErrors={extraErrors}
            record={recordRef.current}
            entityName={type.foreignKey?.principalTable}
            dismissPanel={_onModalDismiss}
            onChange={_onDataChange}
          />
        </Stack>
      </Modal>
      <a href="#" onClick={_onClick}>
        {((
          item[
            attribute.logicalName.endsWith('id')
              ? attribute.logicalName.slice(0, -2)
              : attribute.logicalName
          ] as Record<string, unknown>
        )?.[type.foreignKey?.principalNameColumn?.toLowerCase()!] as React.ReactNode) ??
          '<ingen navn>'}
      </a>
      {}
    </>
  );
};
