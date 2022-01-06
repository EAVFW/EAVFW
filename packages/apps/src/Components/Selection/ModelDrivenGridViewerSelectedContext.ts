import { createContext } from "react";
import { IRecord } from "@eavfw/manifest";
import { IObjectWithKey, Selection } from "@fluentui/react";

export const ModelDrivenGridViewerSelectedContext = createContext({
    selectionDetails: "",
    setSelection: (selection: Selection<Partial<IRecord> & IObjectWithKey>) => { },
    selection: undefined! as Selection<Partial<IRecord> & IObjectWithKey>
});