//import {
//    Dropdown,
//    Icon,
//    IDropdownOption,
//    IDropdownStyles,
//    IButtonStyles,
//    PersonaInitialsColor,
//    PersonaSize,
//    Stack,
//    StackItem,
//    Link as FluentLink,
//    mergeStyles,
//    ITheme,
//    Persona,
//    ThemeContext,
//    Theme,
//    IStyleFunction,
//    IDropdownStyleProps,
//    ThemeProvider,
//    CommandButton,
//    IIconProps
//} from "@fluentui/react";
import Link from "next/link";
import React, { ChangeEvent, Fragment, useEffect, useMemo, useState } from 'react';
//import styles from "./ModelDrivenNavigation.module.scss";
import { useRouter, } from 'next/router'
import { ModelDrivenSitemap } from "../../Model/ModelDrivenSitemap";
import { ModelDrivenSitemapEntry } from "../../Model/ModelDrivenSitemapEntry";
import { useUserProfile } from "../Profile/useUserProfile";
import { useAppInfo } from "../../useAppInfo";
import { useModelDrivenApp, useEAVApp } from "../../useModelDrivenApp";
import { ResolveFeature } from "../../FeatureFlags";
import { useIsMobileDevice } from "@eavfw/utils";
import { FluentProvider, Text, tokens, useId, makeStyles, Select, SelectOnChangeData, Link as FluentLink, Option, Button, Dropdown, DropdownProps } from "@fluentui/react-components";

import {
    Hamburger,
    NavCategory,
    NavCategoryItem,
    NavDrawer,
    NavDrawerBody,
    NavDrawerFooter,
    NavDrawerHeader,
    NavDrawerProps,
    NavItem,
    NavSectionHeader,
    NavSubItem,
    NavSubItemGroup,
} from "@fluentui/react-nav-preview";

export interface ModelDrivenNavigationProps /*extends WithRouterProps, WithAppProps, WithUserProps*/ {
    sitemap: ModelDrivenSitemap
    theme?: any
}
export type ModelDrivenNavigationArea = {
    key: string,
    text: string,
    id: string
}
export interface ModelDrivenNavigationState {
    sitemap: ModelDrivenSitemap,
    areas: ModelDrivenNavigationArea[],
}

//const ModelDrivenGroupItemMarker = (t?: ITheme) => mergeStyles({
//    backgroundColor: t?.palette.themePrimary,
//    transition: "opacity 200ms ease 0s",
//    "opacity": 0,
//    borderRadius: 22,
//    borderRight: `2px solid ${t?.palette.themePrimary};`,
//    borderLeft: `2px solid ${t?.palette.themePrimary};`,
//    marginRight: 6.5,
//    height: "auto",
//    display: "inline-block",
//    selectors: {
//        '&.active': {
//            "opacity": 1,
//        }
//    }
//});

//const dropdownStyles: IStyleFunction<IDropdownStyleProps, IDropdownStyles> = props => ({
//    root: {
//        width: "100%"
//    },
//    title: {
//        border: 0, selectors: {
//            ':hover': {
//                backgroundColor: props.theme?.palette.neutralTertiaryAlt
//            }
//        }
//    },
//});

//const iconStyles: IButtonStyles = {
//    root: {
//        padding: 2,
//        margin: 2,
//        width: 40,

//    },
//    flexContainer: {
//        justifyContent: "center"
//    }
//};

//const IconLeft: IIconProps = {
//    iconName: 'DoubleChevronLeft',
//    style: { color: "#d0d0d0", fontSize: 12 }
//};

//const IconRight: IIconProps = {
//    iconName: 'DoubleChevronRight',
//    style: { color: "#d0d0d0", fontSize: 12 }
//};

function filterEntry(user: any) {

    if (!user)
        return () => false;

    return ([key, entry]: [string, ModelDrivenSitemapEntry]) => {



        if (!entry.roles)
            return true;

        return entry.roles.allowed?.filter(r => user.role.filter((rr: string) => r === rr).length > 0)?.length ?? 0 > 0;
    };
}

function generateLink(entry: ModelDrivenSitemapEntry, selectedArea: string, appName: string): string {
    let basePath = `/apps/${appName}/areas/${selectedArea}`;

    if (entry.type === "dashboard") {
        return `${basePath}/dashboards/${entry.logicalName}`;
    } else if (entry.viewName) {
        return `${basePath}/entities/${entry.logicalName}/views/${entry.viewName}`;
    } else {
        return `${basePath}/entities/${entry.logicalName}`;
    }
}
import {
    Board20Filled,
    Board20Regular,
    ChevronLeft20Filled,
    ChevronLeft20Regular,
    ChevronRight20Filled,
    ChevronRight20Regular,
    bundleIcon
} from "@fluentui/react-icons";
import { PortalCompatProvider } from "@fluentui/react-portal-compat";

const Dashboard = bundleIcon(Board20Filled, Board20Regular);
const ChevronLeft = bundleIcon(ChevronLeft20Filled, ChevronLeft20Regular);
const ChevronRight = bundleIcon(ChevronRight20Filled, ChevronRight20Regular);

const useStyles = makeStyles({
    root: {
        overflow: "hidden",
        display: "flex",
        height: "100%",
    },
    dropdown: {
        flexGrow: "1",
        minWidth: "150px"
    },
    nav: {
        backgroundColor:  tokens.colorNeutralBackground1,
    },
    navText: {
        fontWeight: "inherit",
    },
    navItem: {
        backgroundColor: tokens.colorNeutralBackground1,
        color: tokens.colorBrandForegroundLink,
        ':hover': {
            backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1}, black 10%);`

        }
    }

});
export default function ModelDrivenNavigation({ sitemap }: ModelDrivenNavigationProps) {

    const [{ model, isModelDrivenNavigationOpen }, { toggleNav }] = useEAVApp();


    console.log("EAVAPP nav", [model, sitemap]);

    const appInfo = useAppInfo();

    const router = useRouter();

    // const [areas, setAreas] = useState<ModelDrivenNavigationState["areas"]>([]);
    // const [sitemap, setSiteMap] = useState<ModelDrivenNavigationState["sitemap"]>(props.sitemap);
    // const [selectedArea, setselectedArea] = useState<string>();
    const user = useUserProfile();

    const appName = appInfo.currentAppName;//this.props.router.query.appname;

    const isMobile = useIsMobileDevice();

    const styles = useStyles();
    const labelId = useId("type-label");


    const { areas, selectedArea, groups } = useMemo(() => {
        console.groupCollapsed("AreaFilters");
        console.log("user", user);
        try {
            const areas = Object.keys(sitemap.areas).filter(area => {

                if (!user)
                    return true;

                let noRoleInfoDefined = true;
                for (let g of Object.keys(sitemap.areas[area])) {
                    let group = sitemap.areas[area][g];
                    for (let e of Object.keys(group)) {
                        let roles = group[e].roles;

                        if (roles) {
                            noRoleInfoDefined = false;
                            if (roles?.allowed?.filter(role => user.role.filter((r: string) => role === r).length > 0)?.length ?? 0 > 0) {
                                return true;
                            }
                        }
                    }
                }

                return noRoleInfoDefined;
            }).map(area => ({ key: area, text: area, id: area } as ModelDrivenNavigationArea));
            // setAreas(areas);
            // setselectedArea(router.query.area as string ?? areas[0]?.key);
            const result = {
                areas,
                selectedArea: router.query.area as string ?? areas[0]?.key,
                groups: Object.entries(sitemap.areas[router.query.area as string ?? areas[0]?.key])
                    .map(([groupKey, groupEntry]) => {

                        const entries = Object.entries(groupEntry).filter(filterEntry(user))
                            .sort(([akey, aentry], [bkey, bentry]) => aentry.order - bentry.order);

                        return [groupKey, entries] as [string, typeof entries]
                    }).filter(x => x[1].length > 0)
            }
            console.log(result);
            return result;
        } finally {
            console.groupEnd();
        }
    }, [user, router.query.area])

    const _areaChanged: Required<DropdownProps>["onOptionSelect"] = (value, data) => {
        const _selectedArea = data?.optionValue as string;
        if (selectedArea !== _selectedArea) {

            //  setselectedArea(_selectedArea);

            router.push(`/apps/${router.query.appname}/areas/${_selectedArea}/`);
        }
    }



    if (isMobile) return <></>;
    if (!user)
        return <div>loading</div>


    return (
        <FluentProvider id="themeNavV2" theme={ResolveFeature("topBarV2Theme", false)} className={styles.root}>
            <PortalCompatProvider>
                <NavDrawer 
                    defaultSelectedValue={`${router.query.entityName ?? router.query.dashboard}-${router.query.view}`}
                    selectedValue={`${router.query.entityName ?? router.query.dashboard}-${router.query.view}`}
                    className={styles.nav}
                    open={isModelDrivenNavigationOpen}
                    size="small"
                    type="inline"
                >

                    <NavDrawerHeader>
                       

                            {model.getConfig("SVG_LOGO_PATH") ? <img style={{ overflow: "visible" }} src={model.getConfig("SVG_LOGO_PATH")} /> :
                                <img style={{ padding: 8, boxSizing: "border-box" }}
                                    src="/logo.png"
                                    alt="Logo"
                                />
                            }
                       
                    </NavDrawerHeader>
                    <NavDrawerBody>


                        {selectedArea && groups
                            .map(([groupKey, entries]) =>
                            (
                                <Fragment key={groupKey}>
                                    <NavSectionHeader >{groupKey}</NavSectionHeader>


                                    {entries
                                        .map(([key, entry]) => (
                                            <Link key={key} legacyBehavior href={generateLink(entry, selectedArea, appName)} >
                                                <NavItem className={styles.navItem} href={generateLink(entry, selectedArea, appName)} icon={<Dashboard />} value={`${entry.logicalName}-${entry.viewName}`}>

                                                    <Text className={styles.navText}>{entry.title}</Text>
                                                </NavItem>
                                            </Link>

                                        ))}

                                </Fragment>

                            )
                            )}


                    </NavDrawerBody>

                    <NavDrawerFooter>
                        <div style={{ width:"100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {isModelDrivenNavigationOpen && selectedArea && Object.entries(areas).length > 1 &&
                                <Dropdown className={styles.dropdown} appearance="filled-lighter" value={selectedArea} id="AreaSelector"
                                    onOptionSelect={_areaChanged}
                                    inlinePopup

                                >
                                    {areas.map(a => <Option key={a.key} value={a.key}>{a.text}</Option>)}
                                </Dropdown>
                            }
                            <Button appearance="transparent" size="small" icon={isModelDrivenNavigationOpen ? <ChevronLeft /> : <ChevronRight />} onClick={toggleNav} />
                            {/*<Hamburger onClick={() => setMinized(!minimized)} />*/}
                        </div>


                    </NavDrawerFooter>
                </NavDrawer>
            </PortalCompatProvider>
        </FluentProvider>
    );





    //return (
    //    <FluentProvider id="themeNavV2" theme={ResolveFeature("defaultV2Theme", false)}>
    //        <ThemeProvider style={{ height: "100%" }} id="themeNav" theme={props.theme ?? ResolveFeature("defaultTheme")}>
    //            <ThemeContext.Consumer>
    //                {(theme: Theme | undefined) =>
    //                    <Stack verticalFill as="nav" className={`${!minimized ? styles.ModelDrivenNavigationSmall : styles.ModelDrivenNavigation}`}>
    //                        <StackItem grow className={`${styles.ModelDrivenItemColumn}`}>
    //                            {app.getConfig("SVG_LOGO_PATH") ? <img style={{ overflow: "visible" }} src={app.getConfig("SVG_LOGO_PATH")} /> :
    //                                <img style={{ padding: 8, boxSizing: "border-box" }}
    //                                    src="/logo.png"
    //                                    alt="Logo"
    //                                />
    //                            }
    //                            {selectedArea && <Stack as="ul" className={`${styles.ModelDrivenItemList}`}>

    //                                {Object.entries(sitemap.areas[selectedArea])
    //                                    .map(([groupKey, groupEntry]) =>
    //                                        minimized ? (
    //                                            <Stack as="li" key={groupKey}>
    //                                                <span className={`${styles.ModelDrivenGroupHeader}`}>{groupKey}</span>
    //                                                <Stack as="ul">
    //                                                    {Object.entries(groupEntry).filter(filterEntry(user))
    //                                                        .sort(([akey, aentry], [bkey, bentry]) => aentry.order - bentry.order)
    //                                                        .map(([key, entry]) => (
    //                                                            <li className={styles.ModelDrivenGroupItem} key={key + entry.logicalName}>
    //                                                                <Stack horizontal>
    //                                                                    <div
    //                                                                        className={`${ModelDrivenGroupItemMarker(theme)} ${entry.logicalName === router.query.entityName && router.query.view === entry.viewName ? 'active' : ''}`}></div>
    //                                                                    <Icon iconName="AddInIcon" />
    //                                                                    {entry.viewName ?
    //                                                                        <Link legacyBehavior
    //                                                                            href={generateLink(entry, selectedArea, appName)}>
    //                                                                            <FluentLink
    //                                                                                href={generateLink(entry, selectedArea, appName)}>    {entry.title}</FluentLink>
    //                                                                        </Link>
    //                                                                        :
    //                                                                        <Link legacyBehavior
    //                                                                            href={generateLink(entry, selectedArea, appName)}>
    //                                                                            <FluentLink
    //                                                                                href={generateLink(entry, selectedArea, appName)}>    {entry.title}</FluentLink>
    //                                                                        </Link>
    //                                                                    }
    //                                                                </Stack>
    //                                                            </li>
    //                                                        ))}
    //                                                </Stack>
    //                                            </Stack>
    //                                        )
    //                                            :
    //                                            <Stack as="li" key={groupKey}>
    //                                                <span className={`${styles.ModelDrivenGroupHeaderSmall}`}>
    //                                                    <Persona
    //                                                        imageInitials={groupKey.substring(0, 2).toUpperCase()}
    //                                                        initialsColor={PersonaInitialsColor.warmGray}
    //                                                        size={PersonaSize.size32}
    //                                                    />
    //                                                </span>
    //                                                <Stack as="ul" style={{ justifyContent: "center" }}>
    //                                                    {Object.entries(sitemap.areas[selectedArea][groupKey]).filter(filterEntry(user)).map(([key, entry]) => (
    //                                                        <li className={styles.ModelDrivenGroupItemSmall} key={key + entry.logicalName}>
    //                                                            <Stack horizontal>
    //                                                                <div
    //                                                                    className={`${ModelDrivenGroupItemMarker(theme)} ${entry.logicalName === router.query.entityName && router.query.view === entry.viewName ? 'active' : ''}`}></div>
    //                                                                {entry.viewName ?
    //                                                                    <div>
    //                                                                        <Link legacyBehavior
    //                                                                            href={generateLink(entry, selectedArea, appName)}>
    //                                                                            <FluentLink
    //                                                                                href={generateLink(entry, selectedArea, appName)}>
    //                                                                                <Persona
    //                                                                                    imageInitials={entry.title.substring(0, 2).toUpperCase()}
    //                                                                                    initialsColor={PersonaInitialsColor.blue}
    //                                                                                    size={PersonaSize.size32}
    //                                                                                />
    //                                                                            </FluentLink>
    //                                                                        </Link>
    //                                                                    </div>
    //                                                                    :
    //                                                                    <div>
    //                                                                        <Link legacyBehavior
    //                                                                            href={generateLink(entry, selectedArea, appName)}>
    //                                                                            <FluentLink
    //                                                                                href={generateLink(entry, selectedArea, appName)}>

    //                                                                                <Persona
    //                                                                                    imageInitials={entry.title.substring(0, 2).toUpperCase()}
    //                                                                                    initialsColor={PersonaInitialsColor.blue}
    //                                                                                    size={PersonaSize.size32}
    //                                                                                />
    //                                                                            </FluentLink>
    //                                                                        </Link>
    //                                                                    </div>
    //                                                                }
    //                                                            </Stack>

    //                                                        </li>
    //                                                    ))}
    //                                                </Stack>
    //                                            </Stack>
    //                                    )}
    //                            </Stack>
    //                            }
    //                        </StackItem>
    //                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
    //                            {minimized &&
    //                                <Dropdown id="AreaSelector"
    //                                    selectedKey={selectedArea} onChange={_areaChanged}
    //                                    options={areas}
    //                                    styles={dropdownStyles}
    //                                />
    //                            }
    //                            <CommandButton styles={iconStyles} iconProps={minimized ? IconLeft : IconRight}
    //                                onClick={() => setMinized(!minimized)} />
    //                        </div>
    //                    </Stack>
    //                }
    //            </ThemeContext.Consumer>
    //        </ThemeProvider>
    //    </FluentProvider>
    //)
}
