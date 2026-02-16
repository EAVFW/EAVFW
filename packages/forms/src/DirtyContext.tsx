import { mergeDeep } from '@eavfw/utils';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useEAVForm } from './useEAVForm';

type DirtyFieldElement = {
  [key: string]: DirtyFieldElementValue;
};
type DirtyFieldContainer = { __isDirty: boolean; value: DirtyFieldElementValue };
type DirtyFieldElementValue =
  | DirtyFieldElement
  | undefined
  | Array<DirtyFieldElement>
  | DirtyFieldContainer;

export type SetDirtyFieldsFunction = (dirtyField: string, value?: DirtyFieldElementValue) => void;
export type DirtyContextType = {
  dirtyFields: DirtyFieldElement;
  setDirtyFields: SetDirtyFieldsFunction;
  clearDirtyFields: SetDirtyFieldsFunction;
};
const DirtyContext = createContext<DirtyContextType>({
  dirtyFields: {} as DirtyFieldElement,
  setDirtyFields: (dirtyField: string, value?: DirtyFieldElementValue) => {
    console.log('dirty container updated', [dirtyField, value]);
  },
  clearDirtyFields: (dirtyField: string, value?: DirtyFieldElementValue) => {
    console.log('dirty container updated', [dirtyField, value]);
  },
});

export const useDirtyContext = () => useContext(DirtyContext);

function isDirtyContainer(o: unknown): o is DirtyFieldContainer {
  return typeof o === 'object' && o !== null && '__isDirty' in o;
}
export const DirtyContainer = ({
  id,
  children,
  initialdata = {},
}: PropsWithChildren<{ id: string; initialdata?: DirtyFieldElement }>) => {
  const [_, __, etag] = useEAVForm((state) => null);

  const { setDirtyFields: setParentDirtyFields, dirtyFields: rootDirtyFields } = useDirtyContext();
  const refDirtyFields = useRef<DirtyFieldElement>(initialdata);
  const [dirtyFields, setDirtyFields] = useState<DirtyFieldElement>(refDirtyFields.current);
  const updateDirtyFields = useCallback(
    (dirtyField: string, value?: DirtyFieldElementValue) => {
      if (typeof value === 'object' && value != null)
        refDirtyFields.current[dirtyField] = mergeDeep(
          (refDirtyFields.current[dirtyField] ?? {}) as Record<string, unknown>,
          value as Record<string, unknown>,
        ) as DirtyFieldElementValue;
      else {
        refDirtyFields.current[dirtyField] = { value: value, __isDirty: true };
      }

      setDirtyFields({ ...refDirtyFields.current });
      setParentDirtyFields(id, refDirtyFields.current);
    },
    [id],
  );

  const clearDirtyFields = useCallback(
    (dirtyField: string, value?: DirtyFieldElementValue) => {
      let old = refDirtyFields.current[dirtyField];
      if (isDirtyContainer(old) && value === old?.value) {
        refDirtyFields.current[dirtyField] = { value: value, __isDirty: false };
        setParentDirtyFields(id, refDirtyFields.current);
      }
    },
    [id],
  );

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    if (id === 'root') {
      refDirtyFields.current = initialdata;
      setParentDirtyFields(id, refDirtyFields.current);
    }
  }, [etag, id]);

  const alldirtyFields = useMemo(
    () => Object.assign({}, rootDirtyFields[id] ?? {}, dirtyFields),
    [rootDirtyFields[id], dirtyFields],
  );

  useEffect(() => {}, [alldirtyFields]);

  return (
    <DirtyContext.Provider
      value={{
        dirtyFields: alldirtyFields,
        setDirtyFields: updateDirtyFields,
        clearDirtyFields: clearDirtyFields,
      }}
    >
      {children}
    </DirtyContext.Provider>
  );
};
