import { makeStyles } from "@fluentui/react-components";


export const useStackStyles = makeStyles({
    root: {
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
        '> :not(:last-child)': {
            marginBottom: '10px',
        }
    },
    horizontal: {
        flexDirection: 'row',
        '> :not(:last-child)': {
            marginBottom: '10px',
            marginRight: '10px',
        }
    },
    noGap: {
       
        '> :not(:last-child)': {
            marginBottom: '0px',
            marginRight: '0px',
        }
    },
    verticalFill: {
        height: '100%',
    },
    item: {
        height: 'auto',
        width: 'auto',
        flexShrink: 1,
    },
    itemShrink: {
        flexShrink: 1,
        flexGrow:0,
      
    },
   
    itemGrow: {
       
            flexGrow: 1,
        
        }
})

export const useVerticalFill = makeStyles({
    root: {
        height: '100%',
    },
})

 