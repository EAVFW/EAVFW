import { useEffect, useRef, useState } from 'react';
import { mergeStyles } from '@fluentui/react';
import {
  AttributeDefinition,
  EntityDefinition,
  FormDefinition,
  FormColumnDefinition,
} from '@eavfw/manifest';
import { ModelDrivenApp } from '../../ModelDrivenApp';
import { ResolveFeature } from '../../FeatureFlags';

export const wrapperClass = mergeStyles({
  padding: 2,
  selectors: {
    '& > .ms-Shimmer-container': {
      margin: '10px 0',
    },
  },
});

export const wrapperStyle = { display: 'flex' };

export const groupBy = function <T>(xs: Array<T>, key: (a: T) => string) {
  return xs.reduce(
    function (rv, x) {
      (rv[key(x)] = rv[key(x)] || []).push(x);
      return rv;
    },
    {} as { [key: string]: Array<T> },
  );
};

export function getForm(app: ModelDrivenApp, entityName: string, formName: string) {
  const entity = app.getEntity(entityName);
  const form: FormDefinition = entity?.forms?.[formName] ?? {
    name: 'Main Information',
    type: 'Main',
    layout: {
      tabs: {
        TAB_General: {
          title: 'General Information',
          locale: {
            '1030': {
              title: 'General Information',
            },
          },
          columns: {
            COLUMN_First: {
              sections: {
                SECTION_General: {},
              },
            },
            COLUMN_Second: {
              sections: {
                SECTION_Additional: {},
              },
            },
          },
        },
      },
    },
    columns: Object.fromEntries(
      Object.entries(app.getAttributes(entity.logicalName))
        .filter(([k, entry]) => k.toLowerCase() !== 'id')
        .map(([k, entry]) => [
          k,
          {
            tab: 'TAB_General',
            column: 'COLUMN_First',
            section: 'SECTION_General',
          },
        ]),
    ),
  };

  if (form === undefined) {
    throw new Error('No form available');
  }

  return form;
}

export function createRadioGroups(form: FormDefinition, entity: EntityDefinition) {
  let radioGroups = groupBy(
    Object.keys(form.columns)
      .filter((k) => form.columns[k].radio_group)
      .map(
        (k) =>
          [k, form.columns[k], entity.attributes[k]] as [
            string,
            FormColumnDefinition,
            AttributeDefinition,
          ],
      ),
    (x) => x[1].radio_group!,
  );
  return Object.values(radioGroups);
}

/**
 * Load the evaludated form and only forward it when its actually updated.
 * */
export function useEvaluateFormDefinition(
  form: FormDefinition,
  formDataRefcurrent: Record<string, unknown>,
  formName: string,
  entityName: string,
) {
  const useEvaluateFormDefinition = ResolveFeature('useEvaluateFormDefinition');
  const { evaluatedForm: evaluatedFormDelayed, isEvaluatedFormLoading } = useEvaluateFormDefinition(
    form,
    formDataRefcurrent,
  );
  const [evaluatedForm, setevaluatedForm] = useState(evaluatedFormDelayed);
  const [isLoadingForm, setisLoadingForm] = useState(true);

  const [oldKey, setOldKey] = useState(`${formName}${entityName}`);

  useEffect(() => {
    if (!isEvaluatedFormLoading && evaluatedFormDelayed !== evaluatedForm) {
      setevaluatedForm(evaluatedFormDelayed);
      setisLoadingForm(false);
    }
  }, [evaluatedForm, evaluatedFormDelayed, isEvaluatedFormLoading]);

  return { evaluatedForm, isLoadingForm: false };
}

export const useObservable = (value: unknown, ...deps: unknown[]) => {
  const oldvalue = useRef(value);
  const oldvalues = useRef(deps);
  useEffect(() => {
    if (oldvalues.current.some((c, i) => c !== deps[i]) && oldvalue.current !== value) {
      oldvalues.current = deps;
      oldvalue.current = value;
    }
  }, [value, ...deps]);

  return oldvalue.current;
};
