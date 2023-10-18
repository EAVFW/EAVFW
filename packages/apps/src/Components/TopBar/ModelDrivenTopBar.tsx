import {
    PersonaSize,
    Stack,
    Persona,
    IStackProps,
    ITheme,
    Link as FluentLink,
    Text,
    useTheme,
    ThemeProvider,
    Theme,
    Modal,
    mergeStyleSets,
} from "@fluentui/react";

import Link from "next/link";
import React, { useContext } from "react";
import useSWR from "swr";
import { useId, useBoolean } from '@fluentui/react-hooks';
import { useUserProfile } from "../Profile";
import { ResolveFeature } from "../../FeatureFlags";
import { FluentProvider, Theme as FluentUI9Theme } from "@fluentui/react-components";



export type TopBarProps = {
    title: string;
    search: boolean;
    theme?: Theme
}

const styles2: IStackProps["styles"] = (p: IStackProps, t: ITheme) => ({
    root: {
        height: 42,
        paddingLeft: 8/* background: t.palette.themePrimary, color: t.palette.white*/
    }
});

const personaStyles: IStackProps["styles"] = (p: IStackProps, t: ITheme) => ({
    root: {
        margin: 0, padding: 0,
        cursor: "pointer",
        ':hover': {
            backgroundColor: t.palette.neutralLighterAlt,
        },
    }
});


const contentStyles = mergeStyleSets({
    container: {
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'stretch',
        position: "absolute",
        top: 42,
        right: 0,
        width: 150,
        padding: 8
    },
    persona: {}
});

export function TopBar(props: TopBarProps) {
    const profile = useUserProfile();
    console.log(profile);

    const defaultV2Theme: FluentUI9Theme = ResolveFeature("defaultV2Theme");
    const defaultTheme = ResolveFeature("defaultTheme");

    const [isModalOpen, { setTrue: showModal, setFalse: hideModal, toggle }] = useBoolean(false);
    const titleId = useId('title');
    //   const user = useContext(UserContext);
    return (
        <FluentProvider theme={defaultV2Theme}>
        <ThemeProvider theme={props.theme ?? defaultTheme}>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: 10 }}
                styles={styles2}>
                    <Stack horizontal horizontalAlign="start">
                        <Link href="/" legacyBehavior>
                        <FluentLink theme={useTheme()} href="/" title="Home" role="link"> <Text
                            variant="large"> {props.title}</Text> </FluentLink>
                    </Link>
                </Stack>

                <Stack horizontal horizontalAlign="center">

                </Stack>
                <Stack horizontal horizontalAlign="end" verticalAlign="center" styles={personaStyles}>
                    {profile &&
                        <>
                            <Persona onClick={toggle}
                            text={`${profile.name || profile.email}`}
                            secondaryText={profile.email}
                            imageInitials={((profile.name as string)?.trim().split(' ').map((n: any) => n[0].toUpperCase()).join('') || profile.email.split('@')[0])}
                                size={PersonaSize.size32}
                                hidePersonaDetails={!true}
                            imageAlt={`${profile.name || profile.email}`}
                            />

                            <ThemeProvider theme={defaultTheme}>
                                <Modal
                                    titleAriaId={titleId}
                                    isOpen={isModalOpen}
                                    onDismiss={hideModal}
                                    isModeless={true}
                                    containerClassName={contentStyles.container}
                                    dragOptions={undefined}
                                >
                                    <Stack horizontal horizontalAlign="end" verticalAlign="center">
                                        <Link href={`/.auth/logout?post_logout_redirect_uri=${location.href}`} legacyBehavior>
                                            <FluentLink href={`/.auth/logout?post_logout_redirect_uri=${location.href}`} title="Signout" role="link" >
                                                <Text variant="mediumPlus" >Log ud</Text>
                                            </FluentLink>
                                        </Link>
                                    </Stack>

                                    <Stack horizontal horizontalAlign="start" verticalAlign="center">
                                    <Text variant="mediumPlus">{profile.fullname}</Text>
                                    {profile.role && profile.role.map((role: string) => <div key={role}><br /><Text variant="mediumPlus">{role}</Text></div>)}
                                    </Stack>

                                </Modal>
                            </ThemeProvider>
                        </>}
                </Stack>
            </Stack>
            </ThemeProvider>
        </FluentProvider>
    );
}
