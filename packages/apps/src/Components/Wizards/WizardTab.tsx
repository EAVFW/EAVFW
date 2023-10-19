import { FormTabDefinitionWithColumns } from "@eavfw/manifest";
import { makeStyles, mergeClasses, shorthands, Spinner } from "@fluentui/react-components";
import { Controls } from "../Controls/ControlRegister";
import { ColumnComponentSlim } from "../Forms/AutoForm/ColumnComponent";
import { useStackStyles } from "../useStackStyles";
import { useWizard } from "./useWizard";



const useOverlay = makeStyles({
    container: { position: "relative" },
    root: {
        position: "absolute",
        left: 0, top: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        zIndex: 100,
        ...shorthands.margin(0)
    },
    spinner: {
        ...shorthands.margin(0),
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)"
    },
    grid: {
        display: "grid",
         
    }
});


export const WizardTab: React.FC<{ className?: string, columns?: FormTabDefinitionWithColumns["columns"], controlName?: string }> = ({ columns, controlName, className }) => {

    const [{ isTransitioning }] = useWizard();
    const styles = useOverlay();
    const stack = useStackStyles();
    

    if (!columns || Object.keys(columns).length === 0) {

        if (controlName && controlName in Controls) {
            const Component = Controls[controlName];


            return <div className={mergeClasses(stack.verticalFill, stack.horizontal)} /* tokens={StackTokens}*/ ><Component /></div>
        }
        throw new Error("Control or Columns must be defined, or control is not registered");
    }

    console.log("Rendering tab", [Controls, columns]);
    const ui = (
        <div className={mergeClasses(className, styles.grid, styles.container, stack.verticalFill, stack.horizontal)} /* tokens={{ childrenGap: 25 }}*/ style={{ gridTemplateColumns: `${Object.keys(columns).map(c => '1fr').join(' ')}` }}>
            {isTransitioning && <div className={styles.root} style={{margin:'0px'}}>
                <Spinner className={styles.spinner} size="huge" label="working..." />
            </div>}
            {Object.keys(columns).map((columnName, idx) => (
                <div key={columnName} className={mergeClasses(columnName, stack.item, stack.itemGrow)}>
                    <ColumnComponentSlim column={columns[columnName]} 
                    />
                </div>
            ))}
        </div>
    );
    return ui;

}