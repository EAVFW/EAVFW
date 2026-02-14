'use client';

import { Button, Dropdown, DropdownProps, Option, makeStyles } from '@fluentui/react-components';
import {
  NavDrawer,
  NavDrawerBody,
  NavDrawerFooter,
  NavDrawerHeader,
  NavItem,
  NavSectionHeader,
} from '@fluentui/react-nav-preview';
import { useRouter } from 'next/router';
import { useEAVApp } from '../../useModelDrivenApp';
import { ModelDrivenNavigationArea } from './ModelDrivenNavigation';
import {
  Board20Filled,
  Board20Regular,
  ChevronLeft20Filled,
  ChevronLeft20Regular,
  ChevronRight20Filled,
  ChevronRight20Regular,
  bundleIcon,
} from '@fluentui/react-icons';
import { useFooterStyles } from './styles/useFooterStyles.styles';

const ChevronLeft = bundleIcon(ChevronLeft20Filled, ChevronLeft20Regular);
const ChevronRight = bundleIcon(ChevronRight20Filled, ChevronRight20Regular);

export const ModelDrivenNavDrawerFooter = ({
  selectedArea,
  areas,
}: {
  selectedArea: string;
  areas: ModelDrivenNavigationArea[];
}) => {
  const styles = useFooterStyles();
  const [{ model, isModelDrivenNavigationOpen }, { toggleNav }] = useEAVApp();
  const router = useRouter();
  const _areaChanged: Required<DropdownProps>['onOptionSelect'] = (value, data) => {
    const _selectedArea = data?.optionValue as string;
    if (selectedArea !== _selectedArea) {
      //  setselectedArea(_selectedArea);

      router.push(`/apps/${router.query.appname}/areas/${_selectedArea}/`);
    }
  };

  return (
    <NavDrawerFooter>
      <div
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isModelDrivenNavigationOpen && selectedArea && Object.entries(areas).length > 1 && (
          <Dropdown
            className={styles.dropdown}
            appearance="filled-lighter"
            value={selectedArea}
            id="AreaSelector"
            onOptionSelect={_areaChanged}
            inlinePopup
          >
            {areas.map((a) => (
              <Option key={a.key} value={a.key}>
                {a.text}
              </Option>
            ))}
          </Dropdown>
        )}
        <Button
          appearance="transparent"
          size="small"
          icon={isModelDrivenNavigationOpen ? <ChevronLeft /> : <ChevronRight />}
          onClick={toggleNav}
        />
        {/*<Hamburger onClick={() => setMinized(!minimized)} />*/}
      </div>
    </NavDrawerFooter>
  );
};
