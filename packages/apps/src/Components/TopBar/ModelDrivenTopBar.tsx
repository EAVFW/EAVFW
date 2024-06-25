import {
    PersonaSize,
    Stack,
    // Persona,
    IStackProps,
    ITheme,
    // Link as FluentLink,
    // Text,
    useTheme,
    ThemeProvider,
    Theme,
    Modal,
    mergeStyleSets,
    
    // Dialog,
} from "@fluentui/react";

import Link from "next/link";
import React, { useContext } from "react";
import useSWR from "swr";
import { useId, useBoolean } from '@fluentui/react-hooks';
import { useUserProfile } from "../Profile";
import { ResolveFeature } from "../../FeatureFlags";
import { FluentProvider, Theme as FluentUI9Theme, Link as FluentLink, makeStyles, Text, Persona, Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent } from "@fluentui/react-components";
import { PortalCompatProvider } from "@fluentui/react-portal-compat";
import { Hamburger } from "@fluentui/react-nav-preview";
import { useEAVApp, useModelDrivenApp } from "../../useModelDrivenApp";



export type TopBarProps = {
    title?: string;
    search: boolean;
    theme?: any
    showMenuOpener?: boolean
}

//const styles2: IStackProps["styles"] = (p: IStackProps, t: ITheme) => ({
//    root: {
//        height: 42,
//        paddingLeft: 8/* background: t.palette.themePrimary, color: t.palette.white*/
//    }
//});

//const personaStyles: IStackProps["styles"] = (p: IStackProps, t: ITheme) => ({
//    root: {
//        margin: 0, padding: 0,
//        cursor: "pointer",
//        ':hover': {
//            backgroundColor: t.palette.neutralLighterAlt,
//        },
//    }
//});


const useContentStyles = makeStyles({
    container: {
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'stretch',
        position: "absolute",
        top: "42px",
        right: "0px",
        width: "150px",
        padding: "8px"
    },
    persona: {},
    topBar: {
        height: "42px",
        paddingLeft: "8px",
        display: "flex",
        flexFlow: "row",
        width: "auto",
        boxSizing: "border-box",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px",
    },
    topBarLeft: {
        display: "flex",
        flexFlow: "row",
        width: "auto",
        height: "auto",
        boxSizing: "border-box",
    },
    topBarCenter: {
        display: "flex",
        flexFlow: "row",
        width: "auto",
        height: "auto",
        boxSizing: "border-box",
        justifyContent: "center",
    },
    topBarProfile: {
        display: "flex",
        flexFlow: "row",
        width: "auto",
        height: "auto",
        boxSizing: "border-box",
        justifyContent: "flex-end",
        alignItems: "center",
        margin: "0px",
        padding: "0px",
        cursor: "pointer"
    }
});

export function TopBar({ title, search, showMenuOpener =true, theme }: TopBarProps) {
    const profile = useUserProfile();
    const [app, { toggleNav }] = useEAVApp();
    const styles = useContentStyles();

    const topBarV2Theme: FluentUI9Theme = ResolveFeature("topBarV2Theme", false) ?? ResolveFeature("defaultV2Theme", false);
    const defaultTheme: FluentUI9Theme = ResolveFeature("defaultV2Theme");

    const [isModalOpen, { setTrue: showModal, setFalse: hideModal, toggle }] = useBoolean(false);
    const titleId = useId('title');
    //   const user = useContext(UserContext);
    return (
        <FluentProvider theme={topBarV2Theme}>


            <div className={styles.topBar}>
                <div className={styles.topBarLeft}>
                    {showMenuOpener && profile && <Hamburger onClick={toggleNav} />}
                    {title && <Link href="/" legacyBehavior>
                        <FluentLink href="/" title="Home" role="link"> <Text
                            size={600}> {title}</Text> </FluentLink>
                    </Link>}
                </div>

                <div className={styles.topBarCenter}>

                </div>
                <div className={styles.topBarProfile}>
                    {profile &&
                        <>
                            <Persona onClick={toggle}
                                primaryText={`${profile.name || profile.email}`}
                                secondaryText={profile.email}
                                name={profile.name || profile.email}
                            //imageInitials={((profile.name as string)?.trim().split(' ').map((n: any) => n[0].toUpperCase()).join('') || profile.email.split('@')[0])}

                            // hidePersonaDetails={!true}
                            // imageAlt={`${profile.name || profile.email}`}
                            />

                            <FluentProvider theme={defaultTheme}>
                            <Dialog
                                //  titleAriaId={titleId}
                                open={isModalOpen}
                                onOpenChange={(d, a) => { if (a.open === false) { hideModal() } }}
                                    //      isModeless={true}
                                    modalType="non-modal"

                                >
                                    <DialogSurface>
                                        <DialogBody>
                                            <DialogTitle>User Profile</DialogTitle>
                                            <DialogContent>
                                               
                                                    <Link href={`/.auth/logout?post_logout_redirect_uri=${location.href}`} legacyBehavior>
                                                        <FluentLink href={`/.auth/logout?post_logout_redirect_uri=${location.href}`} title="Signout" role="link" >
                                                            <Text size={400} >Log ud</Text>
                                                        </FluentLink>
                                                    </Link>
                                                 

                                                <Stack horizontal horizontalAlign="start" verticalAlign="center">
                                                    <Text size={400}>{profile.fullname}</Text>
                                                    {profile.role && profile.role.map((role: string) => <div key={role}><br /><Text size={400}>{role}</Text></div>)}
                                                </Stack>
                                            </DialogContent>
                                        </DialogBody>
                                    </DialogSurface>
                                </Dialog>

                            </FluentProvider>
                        </>}
                </div>
            </div>


        </FluentProvider >
    );
}
