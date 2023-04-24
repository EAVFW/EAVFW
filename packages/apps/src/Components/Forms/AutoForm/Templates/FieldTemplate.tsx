import React, { createContext, useContext, useMemo, useState } from "react";
import { FieldTemplateProps } from "@rjsf/core";
import { Callout, FontWeights, getTheme, IButtonStyles, IconButton, IIconProps, IStackStyles, IStackTokens, ITheme, Label, mergeStyleSets, Stack, Text, ThemeContext } from "@fluentui/react";
import { List } from "@fluentui/react";
import { useExpressionParser } from "@eavfw/expressions";
import { JSONSchema7 } from "json-schema";

import { useBoolean, useId } from "@fluentui/react-hooks";
import { warn } from "console";

const stackTokens: IStackTokens = {
    childrenGap: 4,
};
const infoIconProps = { iconName: 'Info' };
const warnIconProps = { iconName: 'Warning' };
const iconButtonStyles: Partial<IButtonStyles> = { root: { marginBottom: -3 } };
const iconWarningButtonStylesFunc= (theme: ITheme)=> ({
    root: { marginBottom: -3 }, icon: { color: theme.palette.yellowDark }
} as Partial<IButtonStyles>) ;

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

export const WarningContext = createContext <Array<{logicalName:string, warning:string}>>([]);



export const EAVFWLabel: React.FC<{ id?: string, label: string, required?: boolean, disabled?: boolean, description: string }> = ({ id, description, required, label, disabled,...props }) => {
    const { data:_label, isLoading, error } = useExpressionParser(label);
    console.log("EAVFWLabel:", id, description, required, label, disabled, props);
    const [isInfoCalloutVisible, { toggle: toggleIsCalloutVisible }] = useBoolean(false);
    const descriptionId = useId('description');
    const iconButtonId = useId('iconButton');
    const titleId = useId('title');
    const _theme = useContext(ThemeContext);
    const contentStyles = useMemo(() => contentStylesFunc(_theme ?? theme), [_theme]);
    const iconCloseButtonStyles = useMemo(() => iconCloseButtonStylesFunc(_theme ?? theme), [_theme]);
    const iconWarningButtonStyles = useMemo(() => iconWarningButtonStylesFunc(_theme ?? theme), [_theme]);

    const warnings = useContext(WarningContext);
    const [isWarningCalloutVisible, { toggle: toggleIsWarningCalloutVisible }] = useBoolean(false);
    const iconButtonWarningId = useId('iconButtonWarningId');
    const [isInfoCalloutVisibleOnHover, setIsInfoCalloutVisibleOnHover] = useState(false)
    const [isWarningCalloutVisibleOnHover, setIsWarningCalloutVisibleOnHover] = useState(false)


    return (
        <>
            <Stack horizontal verticalAlign="center" tokens={stackTokens}>
                <Label htmlFor={id} required={required} disabled={disabled}
                >{_label}</Label>
                {description && <IconButton
                    id={iconButtonId}
                    iconProps={infoIconProps}
                    title="Info"
                    ariaLabel="Info"
                    onClick={toggleIsCalloutVisible}
                    onMouseEnter={() => setIsInfoCalloutVisibleOnHover(true)}
                    onMouseLeave={() => setIsInfoCalloutVisibleOnHover(false)}
                    styles={iconButtonStyles}
                />}
                {warnings.length > 0 && <IconButton
                    id={iconButtonWarningId}
                    iconProps={warnIconProps}
                    title="Warning"
                    ariaLabel="Warning"
                    onClick={toggleIsWarningCalloutVisible}
                    styles={iconWarningButtonStyles}
                />}
            </Stack>

            {isInfoCalloutVisibleOnHover && (
                <Callout
                    target={'#' + iconButtonId}
                    setInitialFocus
                    onDismiss={toggleIsCalloutVisible}
                    ariaDescribedBy={descriptionId}
                    role="alertdialog" className={contentStyles.container}
                >
                    <div className={contentStyles.header}>
                        <span id={titleId}>{label}</span>
                        <IconButton
                            styles={iconCloseButtonStyles}
                            iconProps={cancelIcon}
                            ariaLabel="Close popup modal"
                            onClick={toggleIsCalloutVisible}
                        />
                    </div>

                    <div className={contentStyles.body}>
                        <Stack tokens={stackTokens} horizontalAlign="start" styles={labelCalloutStackStyles}>
                            {description && <span id={descriptionId} dangerouslySetInnerHTML={{ "__html": description }}></span>}
                            {/*  <DefaultButton onClick={toggleIsCalloutVisible}>Close</DefaultButton>*/}
                        </Stack>
                    </div>
                </Callout>
            )}


            {isWarningCalloutVisible && (
                <Callout
                    target={'#' + iconButtonWarningId}
                    setInitialFocus
                    onDismiss={toggleIsWarningCalloutVisible}
                    ariaDescribedBy={descriptionId}
                    role="alertdialog" className={contentStyles.container}
                >
                    <div className={contentStyles.headerWarn}>
                        <span id={titleId}>{label}</span>
                        <IconButton
                            styles={iconCloseButtonStyles}
                            iconProps={cancelIcon}
                            ariaLabel="Close popup modal"
                            onClick={toggleIsWarningCalloutVisible}
                        />
                    </div>

                    <div className={contentStyles.body}>
                        <Stack tokens={stackTokens} horizontalAlign="start" styles={labelCalloutStackStyles}>
                            {warnings.map((w, i) => <span key={w.logicalName + i} dangerouslySetInnerHTML={{ "__html": w.warning }}></span>)}
                            
                        </Stack>
                    </div>
                </Callout>
            )}
        </>
    );

   
    
}

const FieldTemplate = ({
    id,
    children,
    rawErrors = [],
    rawHelp,
    rawDescription,
    classNames,
    hidden,
    description,
    displayLabel,
    required, label, schema, disabled,
    formContext,
}: FieldTemplateProps) => {
    console.log("Field Template:", [id, displayLabel,rawErrors, rawHelp, rawDescription, classNames, hidden, description]);

  
    const parentwarnings = useContext(WarningContext);
    const warnings = useMemo(() => {


        const resultWarnings = schema.type === "object" ? parentwarnings.map(p => ({ warning: p.warning, logicalName:id+"_"+ p.logicalName })) : parentwarnings.filter(w => id == w.logicalName);
        console.log("Filtering Warnings:", [id, schema.type,schema, parentwarnings, resultWarnings]);
        return resultWarnings;
    }, [parentwarnings]);


    // TODO: do this better by not returning the form-group class from master.
    classNames = "ms-Grid-col ms-sm12 " + classNames.replace("form-group", "");
    return (
        <WarningContext.Provider value={warnings}>
        <div
            className={classNames}
            style={{ marginBottom: 15, display: hidden ? "none" : undefined }}>

            {displayLabel && <EAVFWLabel id={id} disabled={disabled} required={required} label={label ?? schema.title}  description={rawDescription} />}

            {children}
            {/*{rawDescription && <Text>{rawDescription}</Text>}*/}
            {rawErrors.length > 0 && <List items={rawErrors} />}
            {rawHelp && <Text id={id}>{rawHelp}</Text>}
            </div>
        </WarningContext.Provider>
    );
};

export default FieldTemplate;