
import { RegisterControl, useAppInfo, useModelDrivenApp } from "@eavfw/apps";
import { queryEntitySWR, useJsonFetcher } from "@eavfw/manifest";
import { Caption1, makeStyles, shorthands, Subtitle1, tokens, Text, mergeClasses } from "@fluentui/react-components";
import { Card, CardHeader, CardProps } from "@fluentui/react-components";
import { useCallback } from "react";
import { DragEvent } from "react";
import styles from "./KanbanBoard.module.scss";


const useStyles = makeStyles({
    kanbancontainer: {
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
    },
    main: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        columnGap: '16px',
        rowGap: '36px'
    },
    title: {
        ...shorthands.margin(0, 0, '12px')
    },
    card: {
       // width: '300px',
        maxWidth: '100%',
        height: 'fit-content',
        marginTop: '12px'
    },
    flex: {
        ...shorthands.gap('4px'),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    appIcon: {
        ...shorthands.borderRadius('4px'),
        height: '32px'
    },
    caption: {
        color: tokens.colorNeutralForeground3
    },
    cardFooter: {
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});


const Title = ({
    children
}: React.PropsWithChildren<{}>) => {
    const styles = useStyles();
    return <Subtitle1 as="h4" block className={styles.title}>
        {children}
    </Subtitle1>;
};

const resolveAsset = (asset: string) => {
    const ASSET_URL = 'https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-card/stories/assets/';
    return `${ASSET_URL}${asset}`;
};

type TaskProps = {
    cardProps: CardProps,
    title: string;
    description: string;
}
const Task: React.FC<TaskProps> = ({ cardProps, title, description }) => {
    const styles = useStyles();
    return <Card className={styles.card} {...cardProps}>
        {/*<header className={styles.flex}>*/}
        {/*    <img className={styles.appIcon} src={resolveAsset('logo.svg')} />*/}
        {/*    <img className={styles.appIcon} src={resolveAsset('logo2.svg')} />*/}
        {/*</header>*/}

        <CardHeader header={<Text weight="semibold">{title}</Text>} description={<Caption1 className={styles.caption}>{ description}</Caption1>} />

        {/*<footer className={mergeClasses(styles.flex, styles.cardFooter)}>*/}
        {/*    <span>Automated</span>*/}
        {/*    <span>3290</span>*/}
        {/*</footer>*/}
    </Card>;
};




type KanbanBoardColumnProps = {
    stateid: any;
    onDrop: any;
    allowDrop: any
    drag: any;
    onCreateTask: any;
    title: string;
    tasks: Array<any>;
}
const KanbanBoardColumn: React.FC<KanbanBoardColumnProps> = ({ stateid, title, onDrop, allowDrop, drag, onCreateTask, tasks }) => {

    return (
        <div className={styles["kanban-block"]} id={stateid} onDrop={onDrop} onDragOver={allowDrop}>
            <strong>{title}</strong>
            {/*<div className={styles["task-button-block"]}>*/}
            {/*    <button className={styles["task-button"]} id="task-button" onClick={onCreateTask}>Create new task</button>*/}
            {/*</div>*/}

            {tasks?.map(task => (<div key={ task.id} id={task.id} draggable="true" onDragStart={drag}>
                <Task cardProps={{ size: "small" }} title={task.name} description={ task.description} />
            </div>))}

        </div>
    )
}
export const KanbanBoard: React.FC = () => {


    const app = useModelDrivenApp();
    const { currentRecordId } = useAppInfo();
    const [baseUrl, jsonFetcher] = useJsonFetcher();

    const boardTasks = queryEntitySWR(app.getEntityFromKey("Board Task"),
        { "$filter": `boardid eq ${currentRecordId}`, "$select": "id,task", "$expand": "task($select=name,id,description,stateid)" });
    const boardColumns = queryEntitySWR(app.getEntityFromKey("Board Column"),
        { "$filter": `boardid eq ${currentRecordId}`, "$select": "taskstate,id", "$expand": "taskstate($select=name,id)" });

    console.log("KanbanBoard", [boardTasks, boardColumns]);

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

        fetch(`${baseUrl}/entities/${app.getEntityFromKey("Task").collectionSchemaName}/records/${taskid}`, {
            method: "PATCH", credentials: "include",            
            body: JSON.stringify({
                stateid: stateid,
            })
        }).then(() => {
            console.log("dropped ", [taskid, ev.currentTarget, stateid]);
        });

        console.log("dropping ", [taskid, ev.currentTarget, stateid]);
    }, []);

    const createTask = useCallback(() => {
        var x = document.getElementById("inprogress")!;
        var y = document.getElementById("done")!;
        var z = document.getElementById("create-new-task-block")!;
        if (x?.style.display === "none") {
            x.style.display = "block";
            y.style.display = "block";
            z.style.display = "none";
        } else {
            x.style.display = "none";
            y.style.display = "none";
            z.style.display = "flex";
        }
    }, []);

    const saveTask = useCallback(() => {
        // var saveButton = document.getElementById("save-button");
        // var editButton = document.getElementById("edit-button");
        // if (saveButton.style.display === "none") {
        //     saveButton.style.display = "block";
        //     editButton.style.display = "none";
        // } else{
        //     saveButton.style.display = "none";
        //     editButton.style.display = "block";
        // }

        var todo = document.getElementById("todo")!;
        //@ts-ignore
        var taskName = document.getElementById("task-name")?.value;
        todo.innerHTML += `
            <div class="task" id="${taskName.toLowerCase().split(" ").join("")}" draggable="true" ondragstart="drag(event)">
                <span>${taskName}</span>
            </div>
            `
    }, []);

    const editTask = useCallback(() => {
        var saveButton = document.getElementById("save-button")!;
        var editButton = document.getElementById("edit-button")!;
        if (saveButton.style.display === "none") {
            saveButton.style.display = "block";
            editButton.style.display = "none";
        } else {
            saveButton.style.display = "none";
            editButton.style.display = "block";
        }
    }, []);

    const st = useStyles();
    return (
        <div className={st.kanbancontainer}>             
            <div className={styles["kanban-board"]}>

                {boardColumns?.data?.items?.map(column =>
                    <KanbanBoardColumn key={column.id} stateid={column.taskstate.id} tasks={boardTasks?.data?.items?.filter(t => t.task.stateid === column.taskstate.id).map(c => c.task)}
                        title={column?.taskstate?.name} 
                        allowDrop={allowDrop}
                        onDrop={drop}
                        drag={drag}
                        onCreateTask={createTask} />) ?? null}

               
                <div className={styles["create-new-task-block"]} id="create-new-task-block">
                    <strong>New Task</strong>
                    <span className={styles["form-row"]}>
                        <label className={styles["form-row-label"]} htmlFor="task-name">Task</label>
                        <input className={styles["form-row-input"]} type="text" name="task-name" id="task-name" />
                    </span>
                    <span className={styles["form-row"]}>
                        <label className={styles["form-row-label"]} htmlFor="task-name">Description</label>
                        <textarea className={styles["form-row-input"]} name="task-description" id="task-description" cols={70} rows={10}></textarea>
                    </span>
                    <span className={styles["form-row"]}>
                        <label className={styles["form-row-label"]} htmlFor="task-name">Status</label>
                        <select className={styles["form-row-input"]} name="task-status" id="task-status">
                            <option value="todo">To Do</option>
                            <option value="inprogress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </span>
                    <span className={styles["form-row-buttons"]}>
                        <button className={styles["edit-button"]} id="edit-button" onClick={editTask}>Edit</button>
                        <button className={styles["save-button"]} id="save-button" onClick={saveTask}>Save</button>
                        <button className={styles["cancel-button"]} id="cancel-button" onClick={createTask}>Cancel</button>
                    </span>
                </div>
            </div>
        </div>)
}

RegisterControl("KanbanBoard", KanbanBoard);