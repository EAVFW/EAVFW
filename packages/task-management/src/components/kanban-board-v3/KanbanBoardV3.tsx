import React, { useCallback, DragEvent } from "react";
import { ModelDrivenApp, RegistereControl, useModelDrivenApp } from "@eavfw/apps";
import { BoardColumn } from "./components";
import { queryEntitySWR, useJsonFetcher } from "@eavfw/manifest";
import { makeStyles } from "@griffel/react";

export const useKanbanBoardStyles = makeStyles({
    kanbanContainer: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        width: 'auto',
        height: 'auto',
        flexGrow:'1',
        boxSizing: 'border-box',
        '> *': {
            textOverflow: 'ellipsis',
        },
        '> :not(:first-child)': {
            marginTop: '0px',
        },
        '> *:not(.ms-StackItem)': {
            flexShrink: 1,
        },
        '@media (max-width: 600px)': {
            width: '100%',
        }
    },
    kanbanBoard: {
        display: "flex",
        flexGrow: '1',
        flexDirection: "row",
        gap: "10px",
        minHeight: "40vh",
        '@media (max-width: 600px)': {
            flexDirection: 'column',
            width: '100%',
        }
    }
});

async function dropTask(taskid: string, stateid: string, baseUrl: string, app: ModelDrivenApp) {
    return fetch(`${baseUrl}/entities/${app.getEntityFromKey("Task").collectionSchemaName}/records/${taskid}`, {
        method: "PATCH", credentials: "include",
        body: JSON.stringify({
            stateid: stateid,
        })
    });
}

type KanbanBoardV3Props = {
    boardId: string;
    onItemClicked?: (id: string) => void;
};

export const KanbanBoardV3: React.FC<KanbanBoardV3Props> = ({ boardId, onItemClicked }) => {
    const style = useKanbanBoardStyles();
    const [baseUrl] = useJsonFetcher();
    const app = useModelDrivenApp();

    const boardTasks = queryEntitySWR(app.getEntityFromKey("Board Task"),
        {
            "$filter": `boardid eq ${boardId}`,
            "$select": "id,task",
            "$expand": "task($select=name,id,description,stateid)"
        }
    );
    const boardColumns = queryEntitySWR(app.getEntityFromKey("Board Column"),
        {
            "$filter": `boardid eq ${boardId}`,
            "$select": "taskstate,id",
            "$expand": "taskstate($select=name,id)"
        }
    );

    const drag = useCallback((ev: DragEvent<HTMLDivElement>) => {
        //@ts-ignore
        ev.dataTransfer.setData("taskid", ev.target.id);
    }, []);
    const allowDrop = useCallback((ev: DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
    }, []);

    const drop = useCallback((ev: DragEvent<HTMLDivElement>) => {
        ev.preventDefault();
        const taskid = ev.dataTransfer.getData("taskid");
        const stateid = ev.currentTarget.id;
        ev.currentTarget.appendChild(document.getElementById(taskid)!);

        dropTask(taskid, stateid, baseUrl, app).then(() => {/* console.log("dropped ", [taskid, ev.currentTarget, stateid]);*/ });
    }, []);

    return (
        <div className={style.kanbanContainer}>
            <div className={style.kanbanBoard}>
                {boardColumns?.data?.items?.map(column => (
                    <BoardColumn
                        key={column.id}
                        stateid={column.taskstate.id}
                        title={column.taskstate.name}
                        tasks={boardTasks?.data?.items?.filter(t => t.task.stateid === column.taskstate.id).map(c => c.task)}
                        allowDrop={allowDrop}
                        onDrop={drop}
                        drag={drag}
                        onItemClicked={onItemClicked}
                    />
                ))}

            </div>
        </div>
    );
};

RegistereControl("KanbanBoardV3", KanbanBoardV3);