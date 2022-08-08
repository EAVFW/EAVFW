import { IColumn, Target } from "@fluentui/react";
import { IRecord } from "@eavfw/manifest";

export type ColumnFilterProps = {
    columns: IColumn[]
   // setColumns: (columns: IColumn[]) => void
    menuTarget?: Target
    isCalloutVisible: boolean
    toggleIsCalloutVisible: () => void
   // items: IRecord[]
  //  setItems: (records: IRecord[]) => void
    currentColumn?: IColumn,
    fetchCallBack: () => void
}