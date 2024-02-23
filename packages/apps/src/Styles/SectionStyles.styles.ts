import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useSectionStyles = makeStyles({

    section: {
        ...shorthands.padding("0.285714rem", "1.143rem"),
        ...shorthands.margin("0.285714rem"),
        ...shorthands.borderRadius("4px"),
        backgroundColor: tokens.colorNeutralBackground1,
        ...shorthands.border("1px", "solid", tokens.colorTransparentStroke),
        boxShadow: "rgba(0, 0, 0, 0.12) 0px 0px 2px, rgba(0, 0, 0, 0.14) 0px 2px 4px;"
    },

    sectionSlim: {
        maxWidth: "430px",
    }

})
