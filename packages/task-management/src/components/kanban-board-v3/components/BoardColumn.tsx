import { makeStyles, shorthands } from "@griffel/react";
import { Task } from "./Task";

export const useBoardColumnStyles = makeStyles({
    kanbanBlock: {
        ...shorthands.padding('0.6rem'),
        width: '33%',
        minWidth: '14rem',
        minHeight: '4.5rem',
        ...shorthands.borderRadius("4px"),
        boxShadow: "rgba(0, 0, 0, 0.12) 0px 0px 2px, rgba(0, 0, 0, 0.14) 0px 2px 4px;",
        '@media (max-width: 600px)': {
            width: '100%',
        }
    },
    taskContainer: {
        cursor:'pointer'
    }
});

type BoardColumnProps = {
    stateid: any;
    onDrop: any;
    allowDrop: any
    drag: any;
    title: string;
    tasks: Array<any>;
    onItemClicked?: (id: string) => void;
}

export const BoardTask = ({ task, handleOnItemClicked,drag }: { task: any, handleOnItemClicked :any,drag:any}) => {
    const styles = useBoardColumnStyles();
    return (<div className={styles.taskContainer}
        key={task.id}
        id={task.id}
        draggable="true"
        onDragStart={drag}
        onClick={handleOnItemClicked}
    >
        <Task title={task.name} description={task.description} />
    </div>)
}

export const BoardColumn: React.FC<BoardColumnProps> = ({ stateid, title, onDrop, allowDrop, drag, tasks, onItemClicked }) => {

    const styles = useBoardColumnStyles();

    const handleOnItemClicked = (id: string) => {
        onItemClicked ? onItemClicked(id) : () => window?.alert(`item clicked ${id} but no function is defined to handle it`);
    };

    return (
        <div
            className={styles.kanbanBlock}
            id={stateid}
            onDrop={onDrop}
            onDragOver={allowDrop}
        >
            <h2><strong>{title}</strong></h2>
            {
                tasks?.map(task => <BoardTask task={ task} key={task.id} drag={drag} handleOnItemClicked={handleOnItemClicked.bind(null, task.id) } />)
            }
        </div>
    );
};