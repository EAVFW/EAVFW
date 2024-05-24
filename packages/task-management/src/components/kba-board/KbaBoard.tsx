import React from "react";
import { useCallback } from "react";
import { RegistereControl, useAppInfo, useModelDrivenApp } from "@eavfw/apps";
import { BoardColumn } from "./components/BoardColumn";
import { EAVDataHelper } from "./data/EAVDataHelper";
import { queryEntitySWR, useJsonFetcher } from "@eavfw/manifest";
import { DragEvent } from "react";
import { makeStyles } from "@griffel/react";


export const useKanbanBoardStyles = makeStyles({
    kanbanContainer: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        width: 'auto',
        height: 'auto',
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
        flexDirection: "row",
        justifyContent: "space-between",
        minHeight: "40vh",
        '@media (max-width: 600px)': {
            flexDirection: 'column',
            width: '100%',
        }
    }
});


type KbaBoardProps = {
    boardId: string;
    onItemClicked?: (id: string) => void;
};

export const KbaBoard: React.FC<KbaBoardProps> = ({ boardId,onItemClicked }) => {
    const style = useKanbanBoardStyles();
    const dataHelper = new EAVDataHelper(useAppInfo(), useModelDrivenApp());
    const [baseUrl] = useJsonFetcher();
    const app = useModelDrivenApp();

    const boardTasks = queryEntitySWR(app.getEntityFromKey("Board Task"), { "$filter": `boardid eq ${boardId}`, "$select": "id,task", "$expand": "task($select=name,id,description,stateid)" });
    const boardColumns = queryEntitySWR(app.getEntityFromKey("Board Column"), { "$filter": `boardid eq ${boardId}`, "$select": "taskstate,id", "$expand": "taskstate($select=name,id)" });

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

        dataHelper.dropTask(taskid, stateid, baseUrl).then(() => {/* console.log("dropped ", [taskid, ev.currentTarget, stateid]);*/ });
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

RegistereControl("KbaBoard", KbaBoard);