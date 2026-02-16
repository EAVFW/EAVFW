import { isLookup, RibbonViewInfo } from '@eavfw/manifest';
import {
  ContextualMenu,
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  ICommandBarItemProps,
  PrimaryButton,
} from '@fluentui/react';
import { useModelDrivenApp } from '../../useModelDrivenApp';
import { useRouter } from 'next/router';
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RibbonState } from './RibbonState';
import { useRibbon } from './useRibbon';
import mitt, { MittEmitter } from 'next/dist/shared/lib/mitt';

import { useId, useBoolean } from '@fluentui/react-hooks';
import { RibbonContext } from './RibbonContext';
import { useEAVForm } from '@eavfw/forms';

const dialogStyles = { main: { maxWidth: 450 } };
const dragOptions = {
  moveMenuItemText: 'Move',
  closeMenuItemText: 'Close',
  menu: ContextualMenu,
  keepInBounds: true,
};
const dialogContentProps = {
  type: DialogType.normal,
  title: 'Data er ikke gemt',
  closeButtonAriaLabel: 'Close',
  subText: 'Vil du gemme dine ændringer før du forlader siden?',
};

function uuidv4() {
  // @ts-expect-error - arithmetic on number literals to build UUID template string
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
  );
}

export const RibbonContextProvider = ({
  children,
  defaultRibbons = {},
}: PropsWithChildren<{ defaultRibbons?: RibbonViewInfo }>) => {
  const app = useModelDrivenApp();
  const router = useRouter();

  const [pastUrl, setPastUrl] = useState<string>();
  const confirmedRef = useRef<boolean>(false);
  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
  const [isDraggable, { toggle: toggleIsDraggable }] = useBoolean(true);

  const labelId: string = useId('RibbonContextProviderLabel');
  const subTextId: string = useId('RibbonContextProviderSubLabel');

  const modalProps = useMemo(
    () => ({
      titleAriaId: labelId,
      subtitleAriaId: subTextId,
      isBlocking: false,
      styles: dialogStyles,
      dragOptions: isDraggable ? dragOptions : undefined,
    }),
    [isDraggable, labelId, subTextId],
  );

  const stateRef = useRef<RibbonState>({ canSave: false, skipRedirect: false, buttons: [] });
  const [ribbonState, setRibbonState2] = useState<RibbonState>(stateRef.current);
  const updateRibbonState = useCallback((state: Partial<RibbonState>) => {
    stateRef.current = { ...stateRef.current, ...state };
    try {
      throw new Error('updateRibbonState');
    } catch (_error) {
      /* Intentional: throw-and-catch used to capture stack trace for debugging */
    }
    setRibbonState2(stateRef.current);
  }, []);

  const ribbonButtonsRef = useRef<ICommandBarItemProps[]>([]);
  const [ribbonButtons, setRibbonButtons] = useState<ICommandBarItemProps[]>(
    ribbonButtonsRef.current,
  );

  const _addButton = (command: ICommandBarItemProps) => {
    if (typeof command.cacheKey === 'undefined' || command.cacheKey === command.key)
      command.cacheKey = uuidv4();

    setRibbonButtons(
      (ribbonButtonsRef.current = ribbonButtonsRef.current
        .filter((k) => k.key !== command.key)
        .concat([command])
        .sort((a, b) => (a.data?.order ?? Infinity) - (b.data?.order ?? Infinity))),
    );
  };
  const _removeButton = (key: string) => {
    setRibbonButtons(
      (ribbonButtonsRef.current = ribbonButtonsRef.current
        .filter((b) => b.key !== key)
        .sort((a, b) => (a.data?.order ?? Infinity) - (b.data?.order ?? Infinity))),
    );
  };

  const { events } = useRibbon();

  const ribbonEvents =
    events ??
    useMemo(() => {
      const mitter = mitt();

      const _onShow = (data: { type: string }) => {
        const button = ribbonButtonsRef.current.filter((k) => k.key === data.type)[0];
        if (button) {
          button.disabled = false;
          setRibbonButtons(ribbonButtonsRef.current.slice());
        }
      };
      const _onHide = (data: { type: string }) => {
        const button = ribbonButtonsRef.current.filter((k) => k.key === data.type)[0];
        if (button) {
          button.disabled = true;
          setRibbonButtons(ribbonButtonsRef.current.slice());
        }
      };

      mitter.on('SHOW_RIBBON_ITEM', _onShow);
      mitter.on('HIDE_RIBBON_ITEM', _onHide);

      return mitter;
    }, []);

  //  const [oldUrl, setOldUrl] = useState<URL>();
  // prompt the user if they try and leave with unsaved changes
  useEffect(() => {
    // if (oldUrl?.href !== window.location.href)
    //                setOldUrl(new URL(window.location.href));

    //  router.

    const warningText = 'Du har data der ikke er gemt, er du sikker på du vil forlade siden?';
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      const hasUnSavedChanges = stateRef.current.canSave; // ribbonState.canSave;
      if (!hasUnSavedChanges) return;
      e.preventDefault();
      return (e.returnValue = warningText);
    };
    const handleBrowseAway = (url: string, props: { shallow?: boolean }) => {
      const hasUnSavedChanges = stateRef.current.canSave; // ribbonState.canSave;

      const oldUrl = new URL(router.asPath, window.location.href);
      const newUrl = new URL(url, window.location.href);

      if (oldUrl.pathname === newUrl.pathname) return;

      if (!hasUnSavedChanges) return;

      if (url === pastUrl && confirmedRef.current) return;

      setPastUrl(url);
      toggleHideDialog();

      //  if (window.confirm(warningText)) return;
      router.events.emit('routeChangeError');
      throw 'routeChange aborted.';
    };

    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleBrowseAway);
    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleBrowseAway);
    };
  }, [ribbonState.canSave, pastUrl]);

  return (
    <>
      <Dialog
        hidden={hideDialog}
        onDismiss={toggleHideDialog}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
      >
        <DialogFooter>
          <PrimaryButton
            onClick={(e) => {
              toggleHideDialog();
              updateRibbonState({ skipRedirect: false });
              //   setRibbonState( ribbonState.skipRedirect = true;

              const onComplete = (e: { entityName: string; id?: string }) => {
                ribbonEvents.off('saveComplete', onComplete);
                const entityName = pastUrl?.match(/entities\/(.*?)\//)?.[1];
                if (entityName) {
                  const targetEntity = app.getEntity(entityName);
                  const currentEntity = app.getEntity(e.entityName);

                  const lookups = Object.values(targetEntity.attributes).filter(
                    (t) =>
                      isLookup(t.type) &&
                      app.getEntityFromKey(t.type.referenceType).logicalName === e.entityName,
                  );

                  const newUrl = new URL(pastUrl!, window.location.href);
                  for (let lookup of lookups) {
                    newUrl.searchParams.set(lookup.logicalName, e.id ?? '');
                  }
                  router.push(newUrl);
                  setPastUrl(undefined);
                } else {
                  router.push(pastUrl!);
                }
              };

              ribbonEvents.on('saveComplete', onComplete);
              ribbonEvents.emit('onSave', e);
            }}
            text="Gem og forsæt"
          />
          <DefaultButton
            onClick={() => {
              confirmedRef.current = true;
              updateRibbonState({ canSave: false });
              toggleHideDialog();
              router.push(pastUrl!);
              setPastUrl(undefined);
            }}
            text="Forlad side"
          />
        </DialogFooter>
      </Dialog>
      <RibbonContext.Provider
        value={{
          ...ribbonState,
          defaultRibbons,
          buttons: ribbonButtons,
          saveCompleted: (data: { entityName: string; id?: string }) => {
            ribbonEvents.emit('saveComplete', data);
          },
          updateState: updateRibbonState,
          addButton: _addButton,
          //        (command) => updateRibbonState({
          //    buttons: ribbonState.buttons.filter(k => k.key !== command.key
          //    ).concat([command])
          //}),
          removeButton: _removeButton,
          //    (key) => {
          //        before: ribbonState.buttons,
          //        after: ribbonState.buttons.filter(b => b.key !== key)
          //    });
          //    updateRibbonState({ buttons: ribbonState.buttons.filter(b => b.key !== key) });
          //},
          events: ribbonEvents,
          registerButton: (button, deps) => {
            if (button.workflow) {
              const [_, { onChange: onFormDataChange }] = useEAVForm(() => ({}));
              button.onClick = useCallback(
                (ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
                  const runner = (async () => {
                    const actions = button.workflow!.actions as Record<
                      string,
                      Record<string, unknown>
                    >;
                    const starter = Object.entries<Record<string, unknown>>(actions).filter(
                      ([actionkey, entry]) =>
                        typeof entry.runAfter === 'undefined' ||
                        !entry.runAfter ||
                        Object.values(entry.runAfter).length === 0,
                    );

                    const queue = starter.slice(0, 1);

                    function handleQueue() {
                      while (queue.length) {
                        const [action, entry] = queue.pop() ?? [];
                        if (!entry) continue;
                        const type = entry.type;
                        switch (type) {
                          case 'UpdateRecord':
                            onFormDataChange((props, ctx) => {
                              ctx.skipValidation = true;

                              ctx.onCommit = () => {
                                queue.push(
                                  ...Object.entries<Record<string, unknown>>(actions).filter(
                                    ([actionkey, entry]) =>
                                      typeof entry.runAfter === 'object' &&
                                      entry.runAfter !== null &&
                                      Object.entries(entry.runAfter).filter(
                                        ([runafterKey, runafterstatus]) => runafterKey === action,
                                      ).length === 1,
                                  ),
                                );
                                handleQueue();
                              };
                              Object.assign(props, (entry.inputs as Record<string, unknown>).data);
                            }); //TODO wait until change is applied

                            break;

                          case 'SaveForm':
                            ribbonEvents.emit('onSave', ev);

                            queue.push(
                              ...Object.entries<Record<string, unknown>>(actions).filter(
                                ([actionkey, entry]) =>
                                  typeof entry.runAfter === 'object' &&
                                  entry.runAfter !== null &&
                                  Object.entries(entry.runAfter).filter(
                                    ([runafterKey, runafterstatus]) => runafterKey === action,
                                  ).length === 1,
                              ),
                            );

                            break;
                        }
                      }
                    }
                    handleQueue();
                  })();
                },
                [button.workflow],
              );
            }

            useEffect(() => {
              if (!button.onClick) {
                button.onClick = (e) => {
                  e?.preventDefault();
                  e?.stopPropagation();
                  ribbonEvents.emit(button.key, e);
                };
              }

              if (button.visible !== false) _addButton(button);

              return () => {
                _removeButton(button.key);
              };
            }, deps ?? []);
          },
        }}
      >
        {' '}
        {children}
      </RibbonContext.Provider>
    </>
  );
};
