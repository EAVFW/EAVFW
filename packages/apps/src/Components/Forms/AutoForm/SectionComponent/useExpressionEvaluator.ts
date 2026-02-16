import { useEffect, useState } from 'react';
import { AutoFormColumnsDefinition, AutoFormControlsDefinition } from '@eavfw/manifest';
import { useEAVForm } from '../../../../../../forms/src';
import { ResolveFeature } from '../../../../FeatureFlags';

export const useExpressionEvaluator = (
  obj1: AutoFormColumnsDefinition | AutoFormControlsDefinition | string,
) => {
  const [formValues] = useEAVForm((x) => x.formValues);
  const [isLoading, setIsloading] = useState(true);
  const [section, setSection] = useState(typeof obj1 === 'string' ? { visible: false } : obj1);

  const expressionProvider = ResolveFeature('ExpressionsProviderAsync', false) as (
    values: Record<string, unknown>,
    expression: string,
  ) => Promise<unknown>;

  useEffect(() => {
    const queue1 = [] as Array<Promise<unknown>>;

    if (typeof obj1 === 'string') {
      expressionProvider(formValues, obj1).then((clone) => {
        setIsloading(false);
        setSection(
          clone as AutoFormColumnsDefinition | AutoFormControlsDefinition | { visible: boolean },
        );
      });
      return;
    }

    function traverse<T1>(obj: T1, queue: Array<Promise<unknown>>) {
      const clone = {} as T1;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];

          if (Array.isArray(value)) {
            clone[key] = value.map((item) => traverse(item, queue)) as typeof value;
          } else if (typeof value === 'object' && value !== null) {
            clone[key] = traverse(value, queue);
          } else if (typeof value === 'string' && value.indexOf('@') !== -1) {
            queue.push(
              expressionProvider(formValues, value).then(
                (newvalue) => (clone[key] = newvalue as T1[typeof key]),
              ),
            );
          } else {
            clone[key] = value;
          }
        }
      }
      return clone;
    }
    const clone = traverse(obj1, queue1);
    Promise.all(queue1).then(() => {
      setIsloading(false);
      setSection(clone);
    });
  }, [formValues, JSON.stringify(obj1)]);

  return [section, isLoading] as [AutoFormColumnsDefinition | AutoFormControlsDefinition, boolean];
};
