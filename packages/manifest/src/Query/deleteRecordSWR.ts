import { EntityDefinition } from "../Entities/EntityDefinition";
import { IRecord } from "../Types/IRecord";

//TODO : Figure out how to mutate/clear swr keys that prefixes this key;


export async function deleteRecordSWR<T extends IRecord>(entity: EntityDefinition, recordId: string) {
    let data = (await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/entities/${entity.collectionSchemaName}/records/${recordId}`,
        { method: "DELETE", credentials: "include" }
    ).then((rsp) => rsp.json())) as { items: Array<T> };
    return data;
}