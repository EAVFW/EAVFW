import { mergeDeep } from "@eavfw/utils";
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useEAVForm } from "./useEAVForm";

type DirtyFieldElement = {
    [key: string]: DirtyFieldElementValue
};
type DirtyFieldContainer = { __isDirty: boolean, value: DirtyFieldElementValue };
type DirtyFieldElementValue = DirtyFieldElement | undefined | Array<DirtyFieldElement> | DirtyFieldContainer;

export type SetDirtyFieldsFunction = (dirtyField: string, value?: DirtyFieldElementValue) => void;
export type DirtyContextType = { dirtyFields: DirtyFieldElement, setDirtyFields: SetDirtyFieldsFunction, clearDirtyFields: SetDirtyFieldsFunction }
const DirtyContext = createContext<DirtyContextType>({
    dirtyFields: {} as DirtyFieldElement,
    setDirtyFields: (dirtyField: string, value?: DirtyFieldElementValue) => { console.log("dirty container updated", [dirtyField, value]) },
    clearDirtyFields: (dirtyField: string, value?: DirtyFieldElementValue) => { console.log("dirty container updated", [dirtyField, value]) }
});

export const useDirtyContext = () => useContext(DirtyContext);

function isDirtyContainer(o: any): o is DirtyFieldContainer {
    return "__isDirty" in o;
}
export const DirtyContainer: React.FC<PropsWithChildren<{ id: string, initialdata?: DirtyFieldElement }>> = ({ id, children, initialdata = {} }) => {

    const [_, __, etag] = useEAVForm((state) => null);



    const { setDirtyFields: setParentDirtyFields, dirtyFields: rootDirtyFields } = useDirtyContext();
    const refDirtyFields = useRef<DirtyFieldElement>(initialdata);
    const [dirtyFields, setDirtyFields] = useState<DirtyFieldElement>(refDirtyFields.current);
    const updateDirtyFields = useCallback((dirtyField: string, value?: DirtyFieldElementValue) => {
        console.log("Setting dirty field " + dirtyField, [JSON.stringify(value),
        JSON.stringify(refDirtyFields.current[dirtyField]), JSON.stringify(refDirtyFields.current),
        typeof value === "object" && value != null ? mergeDeep(refDirtyFields.current[dirtyField] ?? {}) : value, value
        ]);

        if (typeof value === "object" && value != null)
            refDirtyFields.current[dirtyField] = mergeDeep(refDirtyFields.current[dirtyField] ?? {}, value);
        else {
            refDirtyFields.current[dirtyField] = { value: value, __isDirty: true };
        }

        setDirtyFields({ ...refDirtyFields.current });
        setParentDirtyFields(id, refDirtyFields.current);
    }, [id]);

    const clearDirtyFields = useCallback((dirtyField: string, value?: DirtyFieldElementValue) => {

        console.log("clearing dirty field " + dirtyField, [
            JSON.stringify(value),
            JSON.stringify(refDirtyFields.current[dirtyField]),
            JSON.stringify(refDirtyFields.current),
            typeof value === "object" && value != null ? mergeDeep(refDirtyFields.current[dirtyField] ?? {}) : value, value
        ]);

        let old = refDirtyFields.current[dirtyField];
        if (isDirtyContainer(old) && value === old?.value) {
            refDirtyFields.current[dirtyField] = { value: value, __isDirty: false };
            setParentDirtyFields(id, refDirtyFields.current);
        }


    }, [id]);

    const first = useRef(true);
    useEffect(() => {

        if (first.current) {
            first.current = false;
            return;
        }

        if (id === "root") {
            refDirtyFields.current = initialdata;
            setParentDirtyFields(id, refDirtyFields.current);
        }
    }, [etag, id]);


    const alldirtyFields = useMemo(() => Object.assign({}, rootDirtyFields[id] ?? {}, dirtyFields), [rootDirtyFields[id], dirtyFields]);

    useEffect(() => {
        console.log("dirtyFields updated: " + id, [JSON.stringify(alldirtyFields)]);
    }, [alldirtyFields]);

    return (<DirtyContext.Provider value={{
        dirtyFields: alldirtyFields,
        setDirtyFields: updateDirtyFields,
        clearDirtyFields: clearDirtyFields,
    }}>
        {children}
    </DirtyContext.Provider>)
}