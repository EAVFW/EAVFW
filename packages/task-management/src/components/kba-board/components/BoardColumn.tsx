import { makeStyles, shorthands } from "@griffel/react";
import { Task } from "./Task";

export const useBoardColumnStyles = makeStyles({
    kanbanBlock: {
        ...shorthands.padding('0.6rem'),
        width: '30.5%',
        minWidth: '14rem',
        minHeight: '4.5rem',
        ...shorthands.borderRadius('0.3rem'),
        backgroundColor: 'turquoise',
    },
});

type BoardColumnProps = {
    stateid: any;
    onDrop: any;
    allowDrop: any
    drag: any;
    title: string;
    tasks: Array<any>;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({ stateid, title, onDrop, allowDrop, drag, tasks }) => {

    const styles = useBoardColumnStyles();

    return (
        <div
            className={styles.kanbanBlock}
            id={stateid}
            onDrop={onDrop}
            onDragOver={allowDrop}
        >
            <strong>{title}</strong>
            {
                tasks?.map(task => (
                    <div
                        key={task.id}
                        id={task.id}
                        draggable="true"
                        onDragStart={drag}
                        onClick={() => window?.alert(`not implemented yet at ${task.id}`)}
                    >
                        <Task title={task.name} description={task.description} />
                    </div>
                ))
            }
        </div>
    );
};