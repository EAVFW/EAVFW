import Link from 'next/link';
import { Fragment, useMemo } from 'react';
import { useIsMobileDevice, resolveEAVService } from '@eavfw/utils';
import {
  Button,
  Dropdown,
  DropdownProps,
  FluentProvider,
  Option,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
  useId,
} from '@fluentui/react-components';
import { useRouter } from 'next/router';
import { ResolveFeature } from '../../FeatureFlags';
import { ModelDrivenSitemap } from '../../Model/ModelDrivenSitemap';
import { ModelDrivenSitemapEntry } from '../../Model/ModelDrivenSitemapEntry';
import { useAppInfo } from '../../useAppInfo';
import { useEAVApp } from '../../useModelDrivenApp';
import { useUserProfile } from '../Profile/useUserProfile';

import {
  Board20Filled,
  Board20Regular,
  ChevronLeft20Filled,
  ChevronLeft20Regular,
  ChevronRight20Filled,
  ChevronRight20Regular,
  bundleIcon,
} from '@fluentui/react-icons';
import {
  NavDrawer,
  NavDrawerBody,
  NavDrawerFooter,
  NavDrawerHeader,
  NavItem,
  NavSectionHeader,
} from '@fluentui/react-nav-preview';
import { PortalCompatProvider } from '@fluentui/react-portal-compat';
import { useNavigationData } from './hooks/useNavigationData';
import { ModelDrivenNavDrawerFooter } from './ModelDrivenNavDrawerFooter';
import { useSectionStyles } from '../../Styles';

export interface ModelDrivenNavigationProps /*extends WithRouterProps, WithAppProps, WithUserProps*/ {
  sitemap: ModelDrivenSitemap;
  theme?: any;
}
export type ModelDrivenNavigationArea = {
  key: string;
  text: string;
  id: string;
};
export interface ModelDrivenNavigationState {
  sitemap: ModelDrivenSitemap;
  areas: ModelDrivenNavigationArea[];
}

function generateLink(
  entry: ModelDrivenSitemapEntry,
  selectedArea: string,
  appName: string,
): string {
  let basePath = `/apps/${appName}/areas/${selectedArea}`;

  if (entry.type === 'dashboard') {
    return `${basePath}/dashboards/${entry.logicalName}`;
  } else if (entry.viewName) {
    return `${basePath}/entities/${entry.logicalName}/views/${entry.viewName}`;
  } else {
    return `${basePath}/entities/${entry.logicalName}`;
  }
}

const Dashboard = bundleIcon(Board20Filled, Board20Regular);

const useStyles = makeStyles({
  root: {
    overflow: 'hidden',
    flexDirection: 'column',
    display: 'flex',
    height: 'auto',
    padding: '0px',
    marginBottom: '0px',
  },
  areapicker: {
    padding: '0px',
  },
  dropdown: {
    flexGrow: '1',
    minWidth: '150px',
  },
  nav: {
    backgroundColor: tokens.colorNeutralBackground1,
  },
  navText: {
    fontWeight: 'inherit',
  },
  navItem: {
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorBrandForegroundLink,
    ':hover': {
      backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1}, black 10%);`,
    },
  },
});
export default function ModelDrivenNavigation({ sitemap }: ModelDrivenNavigationProps) {
  const logger = resolveEAVService('loggerFactory')('ModelDrivenNavigation');

  const [{ model, isModelDrivenNavigationOpen }, { toggleNav }] = useEAVApp();

  const appInfo = useAppInfo();
  const router = useRouter();
  const user = useUserProfile();
  const appName = appInfo.currentAppName;
  const isMobile = useIsMobileDevice();
  const styles = useStyles();
  const sectionstyles = useSectionStyles();

  const { areas, selectedArea, groups } = useNavigationData(sitemap);

  logger.log('model={model} sitemap={sitemap} areas={areas} group={group}', [
    model,
    sitemap,
    areas,
    groups,
  ]);

  if (isMobile) return <></>;
  if (!user) return <div>loading</div>;

  return (
    <div className={styles.root}>
      <FluentProvider
        id="themeNavV2"
        theme={ResolveFeature('topBarV2Theme', false)}
        className={mergeClasses(sectionstyles.section, sectionstyles.grow, styles.root)}
      >
        <PortalCompatProvider>
          <NavDrawer
            defaultSelectedValue={`${router.query.entityName ?? router.query.dashboard}-${router.query.view}`}
            selectedValue={`${router.query.entityName ?? router.query.dashboard}-${router.query.view}`}
            className={mergeClasses(styles.nav)}
            open={isModelDrivenNavigationOpen}
            size="small"
            type="inline"
          >
            <NavDrawerHeader>
              {model.getConfig('SVG_LOGO_PATH') ? (
                <img style={{ overflow: 'visible' }} src={model.getConfig('SVG_LOGO_PATH')} />
              ) : (
                <img style={{ padding: 8, boxSizing: 'border-box' }} src="/logo.png" alt="Logo" />
              )}
            </NavDrawerHeader>
            <NavDrawerBody>
              {selectedArea &&
                groups.map(([groupKey, entries]) => (
                  <Fragment key={groupKey}>
                    <NavSectionHeader>{groupKey}</NavSectionHeader>

                    {entries.map(([key, entry]) => (
                      <Link
                        key={key}
                        legacyBehavior
                        href={generateLink(entry, selectedArea, appName)}
                      >
                        <NavItem
                          className={styles.navItem}
                          href={generateLink(entry, selectedArea, appName)}
                          icon={<Dashboard />}
                          value={`${entry.logicalName}-${entry.viewName}`}
                        >
                          <Text className={styles.navText}>{entry.title}</Text>
                        </NavItem>
                      </Link>
                    ))}
                  </Fragment>
                ))}
            </NavDrawerBody>
          </NavDrawer>
        </PortalCompatProvider>
      </FluentProvider>
      <FluentProvider
        id="themeNavV2"
        theme={ResolveFeature('topBarV2Theme', false)}
        className={mergeClasses(sectionstyles.section, styles.areapicker)}
      >
        <PortalCompatProvider>
          <ModelDrivenNavDrawerFooter selectedArea={selectedArea} areas={areas} />
        </PortalCompatProvider>
      </FluentProvider>
    </div>
  );
}
