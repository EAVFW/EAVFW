import { mergeDeep } from '@eavfw/utils';
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

import { VisitedFieldElement, VisitedFieldElementValue } from './eavFormUtils';

export type SetVisitedFieldsFunction = (
  visitedField: string,
  value: VisitedFieldElementValue,
) => void;

export type VisitedContextType = {
  visitedFields: VisitedFieldElement;
  setVisitedFields: SetVisitedFieldsFunction;
};

const VisitedContext = createContext<VisitedContextType>({
  visitedFields: {} as VisitedFieldElement,
  setVisitedFields: (visitedField: string, value: VisitedFieldElementValue) => {
    console.log('visited container updated', [visitedField, value]);
  },
});

export const useVisitedContext = () => useContext(VisitedContext);

export const VisitedContainer = ({
  id,
  children,
  initialdata = {},
}: PropsWithChildren<{ id: string; initialdata?: VisitedFieldElement }>) => {
  const { setVisitedFields: setParentVisitedFields, visitedFields: rootVisitedFields } =
    useVisitedContext();
  const refVisitedFields = useRef<VisitedFieldElement>(initialdata);
  const [visitedFields, setVisitedFields] = useState<VisitedFieldElement>(refVisitedFields.current);
  const updateVisitedFields = useCallback(
    (visitedField: string, value: VisitedFieldElementValue = true) => {
      if (typeof value === 'boolean') refVisitedFields.current[visitedField] = value;
      else {
        refVisitedFields.current[visitedField] = mergeDeep(
          (refVisitedFields.current[visitedField] ?? {}) as Record<string, unknown>,
          value as Record<string, unknown>,
        ) as VisitedFieldElementValue;
      }
      setVisitedFields({ ...refVisitedFields.current });
      setParentVisitedFields(id, refVisitedFields.current);
    },
    [id],
  );

  const allvisitedFields = useMemo(
    () => Object.assign({}, rootVisitedFields[id] ?? {}, visitedFields),
    [rootVisitedFields[id], visitedFields],
  );

  useEffect(() => {}, [allvisitedFields]);

  return (
    <VisitedContext.Provider
      value={{
        visitedFields: allvisitedFields,
        setVisitedFields: updateVisitedFields,
      }}
    >
      {children}
    </VisitedContext.Provider>
  );
};
