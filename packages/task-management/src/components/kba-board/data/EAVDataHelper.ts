import { useAppInfo, useModelDrivenApp } from '@eavfw/apps';
import { IDataHelper } from './IDataHelper';
import { queryEntitySWR } from "@eavfw/manifest";

export class EAVDataHelper implements IDataHelper {

    private appInfo: ReturnType<typeof useAppInfo>;
    private app: ReturnType<typeof useModelDrivenApp>;

    constructor(appInfo: ReturnType<typeof useAppInfo>, app: ReturnType<typeof useModelDrivenApp>) {
        this.appInfo = appInfo;
        this.app = app;
    }

    getBoardColumns() {
        return queryEntitySWR(this.app.getEntityFromKey("Board Column"), {
            "$filter": `boardid eq ${this.appInfo.currentRecordId}`,
            "$select": "taskstate,id",
            "$expand": "taskstate($select=name,id)"
        });
    }

    getBoardTasks() {
        return queryEntitySWR(this.app.getEntityFromKey("Board Task"), {
            "$filter": `boardid eq ${this.appInfo.currentRecordId}`,
            "$select": "id,task",
            "$expand": "task($select=name,id,description,stateid)"
        });
    }

    async dropTask(taskid: string, stateid: string, baseUrl: string) {
        return fetch(`${baseUrl}/entities/${this.app.getEntityFromKey("Task").collectionSchemaName}/records/${taskid}`, {
            method: "PATCH", credentials: "include",
            body: JSON.stringify({
                stateid: stateid,
            })
        });
    }
}
