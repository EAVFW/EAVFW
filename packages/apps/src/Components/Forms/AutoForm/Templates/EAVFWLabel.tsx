import { useExpressionParser } from "@eavfw/expressions";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { useContext, useMemo, useState } from "react";
import { Callout, FontWeights, getTheme, IButtonStyles, IconButton, IIconProps, IStackStyles, IStackTokens, ITheme, Label, mergeStyleSets, Stack, ThemeContext } from "@fluentui/react"
import { useWarnings } from "./WarningContext";
import { useDescriptionRenderFunc } from "./DescriptionComponentContext";

import { tokens } from '@fluentui/react-theme';
import { makeStyles } from "@fluentui/react-components";

const useRequiredStyles = makeStyles({
    required: {
        color: tokens.colorPaletteRedForeground3,
        paddingLeft: tokens.spacingHorizontalXS,
    },
    label: {
        marginBottom: '5px',
        display: "flex"
    }
})
const contentStylesFunc = (theme: ITheme) => mergeStyleSets({
    container: {
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'stretch',
        maxWidth: '400px'
    },
    header: [
        // eslint-disable-next-line deprecation/deprecation
        theme.fonts.xLargePlus,
        {
            flex: '1 1 auto',
            borderTop: `2px solid ${theme.palette.themePrimary}`,
            color: theme.palette.neutralPrimary,
            display: 'flex',
            alignItems: 'center',
            fontWeight: FontWeights.semibold,
            padding: '12px 12px 14px 24px',
        },
    ],
    headerWarn: [
        // eslint-disable-next-line deprecation/deprecation
        theme.fonts.xLargePlus,
        {
            flex: '1 1 auto',
            borderTop: `2px solid ${theme.palette.yellowDark}`,
            color: theme.palette.neutralPrimary,
            display: 'flex',
            alignItems: 'center',
            fontWeight: FontWeights.semibold,
            padding: '12px 12px 14px 24px',
        },
    ],
    body: {
        flex: '4 4 auto',
        padding: '0 24px 24px 24px',
        overflowY: 'hidden',

        selectors: {
            p: { margin: '14px 0' },
            'p:first-child': { marginTop: 0 },
            'p:last-child': { marginBottom: 0 },
        },
    },
});

const theme = getTheme();
const iconCloseButtonStylesFunc = (theme: ITheme) => ({
    root: {
        color: theme.palette.yellowDark,
        marginLeft: 'auto',
        marginTop: '4px',
        marginRight: '2px',
    },
    rootHovered: {
        color: theme.palette.neutralDark,
    },
});
const labelCalloutStackStyles: Partial<IStackStyles> = { root: { padding: 20 } };
const cancelIcon: IIconProps = { iconName: 'Cancel' };

const iconWarningButtonStylesFunc = (theme: ITheme) => ({
    root: { marginBottom: -3 }, icon: { color: theme.palette.yellowDark }
} as Partial<IButtonStyles>);


const stackTokens: IStackTokens = {
    childrenGap: 4,
};
const infoIconProps = { iconName: 'Info' };
const warnIconProps = { iconName: 'Warning' };
const iconButtonStyles: Partial<IButtonStyles> = { root: { marginBottom: -3, height:'auto' } };

export const EAVFWLabel: React.FC<{ id?: string, label: string, required?: boolean, disabled?: boolean, description?: string }> = ({ id, description, required, label, disabled, ...props }) => {
    const { data: _label, isLoading, error } = useExpressionParser(label);
    console.log("EAVFWLabel:", id, description, required, label, disabled, props);
    const [isInfoCalloutVisible, { toggle: toggleIsCalloutVisible }] = useBoolean(false);
    const descriptionId = useId(id + '_description');   //id contains data attribute, so reference is possible through descriptionId
    const iconButtonId = useId('iconButton');
    const titleId = useId('title');
    const _theme = useContext(ThemeContext);
    const contentStyles = useMemo(() => contentStylesFunc(_theme ?? theme), [_theme]);
    const iconCloseButtonStyles = useMemo(() => iconCloseButtonStylesFunc(_theme ?? theme), [_theme]);
    const iconWarningButtonStyles = useMemo(() => iconWarningButtonStylesFunc(_theme ?? theme), [_theme]);

    const warnings = useWarnings();
    const [isWarningCalloutVisible, { toggle: toggleIsWarningCalloutVisible }] = useBoolean(false);
    const iconButtonWarningId = useId('iconButtonWarningId');
    const [isInfoCalloutVisibleOnHover, setIsInfoCalloutVisibleOnHover] = useState(false)
    const [isWarningCalloutVisibleOnHover, setIsWarningCalloutVisibleOnHover] = useState(false)
    const requiredStyles = useRequiredStyles();
    const { renderFunc: DescriptionComponent } = useDescriptionRenderFunc();

    return (
        <div className={requiredStyles.label}>
             

            {_label}{required ? <span className={requiredStyles.required}>*</span> : null}
            {description && <IconButton
                    id={iconButtonId}
                    iconProps={infoIconProps}
                    title="Info"
                    ariaLabel="Info"
                    onClick={toggleIsCalloutVisible}
                    onMouseEnter={() => setIsInfoCalloutVisibleOnHover(true)}
                    onMouseLeave={() => setIsInfoCalloutVisibleOnHover(false)}
                    onFocus={() => setIsInfoCalloutVisibleOnHover(true)}
                    onBlur={() => setIsInfoCalloutVisibleOnHover(false)}
                    styles={iconButtonStyles}
                />}
                {warnings.length > 0 && <IconButton
                    id={iconButtonWarningId}
                    iconProps={warnIconProps}
                    title="Warning"
                    ariaLabel="Warning"
                    onClick={toggleIsWarningCalloutVisible}
                    onMouseEnter={() => setIsWarningCalloutVisibleOnHover(true)}
                    onMouseLeave={() => setIsWarningCalloutVisibleOnHover(false)}
                    onFocus={() => setIsWarningCalloutVisibleOnHover(true)}
                    onBlur={() => setIsWarningCalloutVisibleOnHover(false)}
                    styles={iconWarningButtonStyles}
                />}
            

            {(isInfoCalloutVisible || isInfoCalloutVisibleOnHover) && (
                <Callout
                    target={'#' + iconButtonId}
                    setInitialFocus
                    onDismiss={toggleIsCalloutVisible}
                    ariaDescribedBy={descriptionId}
                    role="alertdialog" className={contentStyles.container}
                >
                    <div className={contentStyles.header}>
                        <span id={titleId}>{label}</span>
                        {isInfoCalloutVisible && <IconButton
                            styles={iconCloseButtonStyles}
                            iconProps={cancelIcon}
                            ariaLabel="Close popup modal"
                            onClick={toggleIsCalloutVisible}
                        />}
                    </div>

                    <div className={contentStyles.body}>
                        <Stack tokens={stackTokens} horizontalAlign="start" styles={labelCalloutStackStyles}>
                            <DescriptionComponent description={description} descriptionId={descriptionId} />

                            {/*  <DefaultButton onClick={toggleIsCalloutVisible}>Close</DefaultButton>*/}
                        </Stack>
                    </div>
                </Callout>
            )}


            {(isWarningCalloutVisible || isWarningCalloutVisibleOnHover) && (
                <Callout
                    target={'#' + iconButtonWarningId}
                    setInitialFocus
                    onDismiss={toggleIsWarningCalloutVisible}
                    ariaDescribedBy={descriptionId}
                    role="alertdialog" className={contentStyles.container}
                >
                    <div className={contentStyles.headerWarn}>
                        <span id={titleId}>{label}</span>
                        {isWarningCalloutVisible && <IconButton
                            styles={iconCloseButtonStyles}
                            iconProps={cancelIcon}
                            ariaLabel="Close popup modal"
                            onClick={toggleIsWarningCalloutVisible}
                        />}
                    </div>

                    <div className={contentStyles.body}>
                        <Stack tokens={stackTokens} horizontalAlign="start" styles={labelCalloutStackStyles}>
                            {warnings.map((w, i) => <span key={w.logicalName + i} dangerouslySetInnerHTML={{ "__html": w.warning }}></span>)}

                        </Stack>
                    </div>
                </Callout>
            )}
        </div>
    );



}