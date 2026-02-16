import {
  AttributeDefinition,
  EntityDefinition,
  getNavigationProperty,
  getRecordSWR,
  IRecord,
  isLookup,
  isPolyLookup,
} from '@eavfw/manifest';
import { useRouter } from 'next/router';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cleanDiff, deepDiffMapper } from '@eavfw/utils';
import { useModelDrivenApp } from '../../useModelDrivenApp';
import { errorMessageFactory, successMessageFactory, useMessageContext } from '../MessageArea';
import { useProgressBarContext } from '../ProgressBar';
import { useRibbon } from '../Ribbon';
import { handleValidationErrors } from '../../Validation';
import { FormValidation } from '@rjsf/utils';
import { useAppInfo } from '../../useAppInfo';

export type FormDataContextProps = {
  mutate: () => void;
  record?: IRecord;
  isLoading: boolean;
  onChangeCallback: (
    formData: Record<string, unknown>,
    ctx?: { onCommit?: () => void; skipValidation?: boolean },
  ) => void;
  addExpand: (str: string) => () => void;
  extraErrors?: FormValidation;
};
const FormDataContext = createContext<FormDataContextProps>({
  mutate: () => {},
  isLoading: false,
  onChangeCallback: (data, ctx) => {},
  addExpand: (str: string) => {
    return () => {};
  },
});
export const useFormChangeHandlerProvider = () => useContext(FormDataContext);
export const FormChangeHandlerProvider = ({
  children,
  recordId,
}: PropsWithChildren<{ recordId?: string }>) => {
  const app = useModelDrivenApp();
  const router = useRouter();

  if (!router.query.area || !router.query.entityName) return <div>loading </div>;

  const entity = app.getEntity(router.query.entityName as string);
  const formName = router.query.formname as string;

  const attributes = Object.values(entity.attributes).map((a) => a.logicalName);
  // const [record, setRecord] = useState(Object.fromEntries(Object.keys(router.query).filter(logicalName => attributes.indexOf(logicalName) !== -1).map(k => [k, router.query[k]])));
  const entityName = router.query.entityName as string;

  const value = useFormChangeHandler(
    entity,
    recordId,
    recordId
      ? undefined
      : Object.fromEntries(
          Object.keys(router.query)
            .filter((logicalName) => attributes.indexOf(logicalName) !== -1)
            .map((k) => [k, router.query[k]]),
        ),
  );

  if (value.isLoading) return <div>loading</div>;

  return (
    <FormDataContext.Provider
      value={value}
      key={`${router.query.entityName}${formName}${value?.record?.id}`}
    >
      {children}
    </FormDataContext.Provider>
  );
};

export function useFormChangeHandler(
  entity: EntityDefinition,
  recordId?: string,
  initialdata?: Record<string, unknown>,
) {
  const router = useRouter();
  //  const [_, setEtag] = useState(new Date().toISOString());

  const { currentAppName, currentAreaName } = useAppInfo();
  const app = useModelDrivenApp();
  const [extraErrors, setExtraErrors] = useState({} as FormValidation);
  const attributes = useMemo(
    () => ({
      ...((entity.TPT && app.getEntity(entity.TPT).attributes) ?? {}),
      ...entity.attributes,
    }),
    [entity.logicalName],
  );
  const formName = router.query.formname as string;
  const formQuery = useMemo(() => entity.forms?.[formName]?.query, [formName]);

  const { skipRedirect, updateState: updateRibbonState, saveCompleted, events } = useRibbon();

  const entitySaveMessageKey = 'entitySaved';
  const { addMessage, removeMessage } = useMessageContext();
  const { showIndeterminateProgressIndicator, hideProgressBar } = useProgressBarContext();

  const defaultData = useMemo(() => {
    var data = initialdata;
    if (typeof recordId === 'undefined') {
      for (let attr of Object.values(attributes)) {
        if (typeof attr.default !== 'undefined') {
          data = data ?? {};
          data[attr.logicalName] = attr.default;
        }
      }
    }
    return data;
  }, [initialdata, attributes]);

  const [localExpands, setExpands] = useState<string[]>([]);
  const addExpand = useCallback((str: string) => {
    setExpands((old) => [...old, str]);
    return () => {
      setExpands((old) => old.filter((x) => x !== str));
    };
  }, []);
  const expand = useMemo(() => {
    if (formQuery?.version === '1.0') {
      let form = entity.forms?.[formName];
      let columns = form?.columns ?? {};
      let expand = Object.entries(attributes)
        .filter(([k, a]) => k in columns && columns[k].query?.expand !== false && isLookup(a.type))
        .map(([k, a]) => getNavigationProperty(a))
        .join(',');

      return expand;
    }

    function expandLookup(a: AttributeDefinition) {
      let type = a.type;

      if (isPolyLookup(type)) {
        if (type.split) {
          return type.referenceTypes.map((k) => {
            let referenceSchemaName = `${entity.schemaName}${app.getEntityFromKey(k).schemaName}References`;
            let reference = app.getEntityFromCollectionSchemaName(referenceSchemaName);
            return `${referenceSchemaName}($select=id,${app.getSelectQueryParamForExpand(reference)};$expand=${app.getExpandQueryParam(reference, false, false, entity)})`;
          });
        }
      }
      return [getNavigationProperty(a)];
    }
    let expand = Object.values(attributes)
      .filter((a) => isLookup(a.type) && !a.type.inline)
      .map(expandLookup)
      .flat()
      .concat(localExpands)
      .join(',');
    if (formQuery?.['$expand']) {
      expand = expand + ',' + formQuery['$expand'];
    }
    return expand;
  }, [attributes, recordId, formQuery?.['$expand'], localExpands]);

  const { record, isLoading, mutate } = getRecordSWR(
    entity.collectionSchemaName,
    recordId!,
    expand ? `?$expand=${expand}` : '',
    typeof recordId !== 'undefined',
    defaultData as IRecord | undefined,
  );

  const changedRecord = useRef(record);

  const onChangeCallback = useCallback(
    (formData: Record<string, unknown>, ctx?: { onCommit?: () => void }) => {
      try {
        changedRecord.current = formData as IRecord;

        const [changed, changedValues] = cleanDiff(
          deepDiffMapper.map(recordId ? record : {}, changedRecord.current),
        );

        setTimeout(() => {
          updateRibbonState({ canSave: changed });
          if (ctx?.onCommit) {
            ctx.onCommit();
          }
        });
      } finally {
      }
    },
    [record?.rowversion ?? record],
  );

  useEffect(() => {
    const entitySaveMessageKey = 'entitySaved';
    const onSaveCallBack = async () => {
      showIndeterminateProgressIndicator();
      updateRibbonState({ canSave: false, skipRedirect: false });

      let rsp = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entity.collectionSchemaName}/records${recordId ? `/${recordId}` : ``}`,
        {
          method: recordId ? 'PATCH' : 'POST',
          body: JSON.stringify(changedRecord.current),
          credentials: 'include',
        },
      );

      hideProgressBar();

      if (rsp.ok) {
        let data = await rsp.json();
        if (!skipRedirect && !recordId) {
          router.pathname = app.recordUrl({
            recordId: data.id,
            entityName: entity.logicalName,
            appName: currentAppName,
            areaName: currentAreaName,
          }); // "/apps/[appname]/areas/[area]/entities/[entityName]/records/[recordId]/forms/[formname]";
          router.query.recordId = data.id;

          router.replace(router, undefined, { shallow: true });
        } else {
          //  setEtag(new Date().toISOString());
          mutate();
        }

        saveCompleted({ entityName: entity.logicalName, id: data.id });

        addMessage(
          entitySaveMessageKey,
          successMessageFactory(
            {
              key: entitySaveMessageKey,
              removeMessage: removeMessage,
            },
            app,
          ),
        );

        return 1;
      }

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

      saveCompleted({ entityName: entity.logicalName });

      return 0;
    };

    const onSaveAndCloseCallback = async () => {
      updateRibbonState({ skipRedirect: true });

      if (await onSaveCallBack()) router.back();
    };

    events.on('onSave', onSaveCallBack);
    events.on('onSaveAndClose', onSaveAndCloseCallback);
    return () => {
      hideProgressBar();
      events.off('onSave', onSaveCallBack);
      events.off('onSaveAndClose', onSaveAndCloseCallback);
    };
  }, [record, recordId, entity.collectionSchemaName, router.query.tabName]);

  useEffect(() => {
    // useRef could be used here to avoid running on first render,
    // but it's not worth it.
    return () => {
      removeMessage(entitySaveMessageKey);
    };
  }, [recordId]);

  return {
    onChangeCallback,
    record,
    isLoading: typeof recordId === 'undefined' ? false : isLoading || typeof record === 'undefined',
    extraErrors,
    mutate,
    addExpand,
  };
}
