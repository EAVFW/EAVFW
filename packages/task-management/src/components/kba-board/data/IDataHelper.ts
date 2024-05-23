import { IRecord } from "@eavfw/manifest";

export interface IDataHelper {
    getBoardColumns(boardId: string): any; 
    getBoardTasks(boardId: string): any;
}
