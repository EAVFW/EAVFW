import {
    Dropdown,
    Icon,
    IDropdownOption,
    IDropdownStyles,
    IButtonStyles,
    PersonaInitialsColor,
    PersonaSize,
    Stack,
    StackItem,
    Link as FluentLink,
    mergeStyles,
    ITheme,
    Persona,
    ThemeContext,
    Theme,
    IStyleFunction,
    IDropdownStyleProps,
    ThemeProvider,
    CommandButton,
    IIconProps
} from "@fluentui/react";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import styles from "./ModelDrivenNavigation.module.scss";
import { useRouter, } from 'next/router'
import { ModelDrivenSitemap } from "../../ModelDrivenSitemap";
import { ModelDrivenSitemapEntry } from "../../ModelDrivenSitemapEntry";
import { useUserProfile } from "../Profile/useUserProfile";
import { useAppInfo } from "../../useAppInfo";
import { useModelDrivenApp } from "../../useModelDrivenApp";
import { ResolveFeature } from "../../FeatureFlags";
import { useIsMobileDevice } from "@eavfw/utils";
import { FluentProvider } from "@fluentui/react-components";

export interface ModelDrivenNavigationProps /*extends WithRouterProps, WithAppProps, WithUserProps*/ {
    sitemap: ModelDrivenSitemap
    theme?: Theme
}

export interface ModelDrivenNavigationState {
    sitemap: ModelDrivenSitemap,
    areas: IDropdownOption[],
}

const ModelDrivenGroupItemMarker = (t?: ITheme) => mergeStyles({
    backgroundColor: t?.palette.themePrimary,
    transition: "opacity 200ms ease 0s",
    "opacity": 0,
    borderRadius: 22,
    borderRight: `2px solid ${t?.palette.themePrimary};`,
    borderLeft: `2px solid ${t?.palette.themePrimary};`,
    marginRight: 6.5,
    height: "auto",
    display: "inline-block",
    selectors: {
        '&.active': {
            "opacity": 1,
        }
    }
});

const dropdownStyles: IStyleFunction<IDropdownStyleProps, IDropdownStyles> = props => ({
    root: {
        width: "100%"
    },
    title: {
        border: 0, selectors: {
            ':hover': {
                backgroundColor: props.theme?.palette.neutralTertiaryAlt
            }
        }
    },
});

const iconStyles: IButtonStyles = {
    root: {
        padding: 2,
        margin: 2,
        width: 40,

    },
    flexContainer: {
        justifyContent: "center"
    }
};

const IconLeft: IIconProps = {
    iconName: 'DoubleChevronLeft',
    style: { color: "#d0d0d0", fontSize: 12 }
};

const IconRight: IIconProps = {
    iconName: 'DoubleChevronRight',
    style: { color: "#d0d0d0", fontSize: 12 }
};

function filterEntry(user: any) {
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


export default function ModelDrivenNavigation(props: ModelDrivenNavigationProps) {

    const app = useModelDrivenApp();
    const appInfo = useAppInfo();
    const router = useRouter();
    const [areas, setAreas] = useState<ModelDrivenNavigationState["areas"]>([]);
    const [sitemap, setSiteMap] = useState<ModelDrivenNavigationState["sitemap"]>(props.sitemap);
    const [selectedArea, setselectedArea] = useState<string>();
    const user = useUserProfile();
    const [minimized, setMinized] = useState(true);

    const appName = appInfo.currentAppName;//this.props.router.query.appname;

    const isMobile = useIsMobileDevice();

    useEffect(() => {
        console.groupCollapsed("AreaFilters");
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
            }).map(area => ({ key: area, text: area, id: area } as IDropdownOption));
            setAreas(areas);

            setselectedArea(router.query.area as string ?? areas[0]?.key);
        } finally {
            console.groupEnd();
        }
    }, [user])

    const _areaChanged = (value: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
        const selectedArea = option?.key as string;
        setselectedArea(selectedArea);
        router.push(`/apps/${router.query.appname}/areas/${selectedArea}/`);
    }

    if (isMobile) return <></>;
    if (!user)
        return <div>loading</div>

    return (
        <FluentProvider id="themeNavV2" theme={ResolveFeature("defaultV2Theme", false)}>
            <ThemeProvider style={{ height: "100%" }} id="themeNav" theme={props.theme ?? ResolveFeature("defaultTheme")}>
                <ThemeContext.Consumer>
                    {(theme: Theme | undefined) =>
                        <Stack verticalFill as="nav" className={`${!minimized ? styles.ModelDrivenNavigationSmall : styles.ModelDrivenNavigation}`}>
                            <StackItem grow className={`${styles.ModelDrivenItemColumn}`}>
                                {app.getConfig("SVG_LOGO_PATH") ? <img style={{ overflow: "visible" }} src={app.getConfig("SVG_LOGO_PATH")} /> :
                                    <img style={{ padding: 8, boxSizing: "border-box" }}
                                        src="/logo.png"
                                        alt="Logo"
                                    />
                                }
                                {selectedArea && <Stack as="ul" className={`${styles.ModelDrivenItemList}`}>

                                    {Object.entries(sitemap.areas[selectedArea])
                                        .map(([groupKey, groupEntry]) =>
                                            minimized ? (
                                                <Stack as="li" key={groupKey}>
                                                    <span className={`${styles.ModelDrivenGroupHeader}`}>{groupKey}</span>
                                                    <Stack as="ul">
                                                        {Object.entries(groupEntry).filter(filterEntry(user))
                                                            .sort(([akey, aentry], [bkey, bentry]) => aentry.order - bentry.order)
                                                            .map(([key, entry]) => (
                                                                <li className={styles.ModelDrivenGroupItem} key={key + entry.logicalName}>
                                                                    <Stack horizontal>
                                                                        <div
                                                                            className={`${ModelDrivenGroupItemMarker(theme)} ${entry.logicalName === router.query.entityName && router.query.view === entry.viewName ? 'active' : ''}`}></div>
                                                                        <Icon iconName="AddInIcon" />
                                                                        {entry.viewName ?
                                                                            <Link legacyBehavior
                                                                                href={generateLink(entry, selectedArea, appName)}>
                                                                                <FluentLink
                                                                                    href={generateLink(entry, selectedArea, appName)}>    {entry.title}</FluentLink>
                                                                            </Link>
                                                                            :
                                                                            <Link legacyBehavior
                                                                                href={generateLink(entry, selectedArea, appName)}>
                                                                                <FluentLink
                                                                                    href={generateLink(entry, selectedArea, appName)}>    {entry.title}</FluentLink>
                                                                            </Link>
                                                                        }
                                                                    </Stack>
                                                                </li>
                                                            ))}
                                                    </Stack>
                                                </Stack>
                                            )
                                                :
                                                <Stack as="li" key={groupKey}>
                                                    <span className={`${styles.ModelDrivenGroupHeaderSmall}`}>
                                                        <Persona
                                                            imageInitials={groupKey.substring(0, 2).toUpperCase()}
                                                            initialsColor={PersonaInitialsColor.warmGray}
                                                            size={PersonaSize.size32}
                                                        />
                                                    </span>
                                                    <Stack as="ul" style={{ justifyContent: "center" }}>
                                                        {Object.entries(sitemap.areas[selectedArea][groupKey]).filter(filterEntry(user)).map(([key, entry]) => (
                                                            <li className={styles.ModelDrivenGroupItemSmall} key={key + entry.logicalName}>
                                                                <Stack horizontal>
                                                                    <div
                                                                        className={`${ModelDrivenGroupItemMarker(theme)} ${entry.logicalName === router.query.entityName && router.query.view === entry.viewName ? 'active' : ''}`}></div>
                                                                    {entry.viewName ?
                                                                        <div>
                                                                            <Link legacyBehavior
                                                                                href={generateLink(entry, selectedArea, appName)}>
                                                                                <FluentLink
                                                                                    href={generateLink(entry, selectedArea, appName)}>
                                                                                    <Persona
                                                                                        imageInitials={entry.title.substring(0, 2).toUpperCase()}
                                                                                        initialsColor={PersonaInitialsColor.blue}
                                                                                        size={PersonaSize.size32}
                                                                                    />
                                                                                </FluentLink>
                                                                            </Link>
                                                                        </div>
                                                                        :
                                                                        <div>
                                                                            <Link legacyBehavior
                                                                                href={generateLink(entry, selectedArea, appName)}>
                                                                                <FluentLink
                                                                                    href={generateLink(entry, selectedArea, appName)}>

                                                                                    <Persona
                                                                                        imageInitials={entry.title.substring(0, 2).toUpperCase()}
                                                                                        initialsColor={PersonaInitialsColor.blue}
                                                                                        size={PersonaSize.size32}
                                                                                    />
                                                                                </FluentLink>
                                                                            </Link>
                                                                        </div>
                                                                    }
                                                                </Stack>

                                                            </li>
                                                        ))}
                                                    </Stack>
                                                </Stack>
                                        )}
                                </Stack>
                                }
                            </StackItem>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {minimized &&
                                    <Dropdown id="AreaSelector"
                                        selectedKey={selectedArea} onChange={_areaChanged}
                                        options={areas}
                                        styles={dropdownStyles}
                                    />
                                }
                                <CommandButton styles={iconStyles} iconProps={minimized ? IconLeft : IconRight}
                                    onClick={() => setMinized(!minimized)} />
                            </div>
                        </Stack>
                    }
                </ThemeContext.Consumer>
            </ThemeProvider>
        </FluentProvider>
    )
}
