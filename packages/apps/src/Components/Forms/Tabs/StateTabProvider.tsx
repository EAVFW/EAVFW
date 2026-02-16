import { PropsWithChildren, useState } from 'react';
import { TabContext } from './TabContext';

export const StateTabProvider = ({
  defaultTab = 'TAB_General',
  defaultTabs = [],
  children,
}: PropsWithChildren<{ defaultTabs?: string[]; defaultTab?: string }>) => {
  const [tabName, setSelectedTab] = useState<string>(defaultTab);
  const [tabs, setTabs] = useState(defaultTabs);

  return (
    <TabContext.Provider value={{ tabName, onTabChange: setSelectedTab, tabs, setTabs }}>
      {' '}
      {children}{' '}
    </TabContext.Provider>
  );
};
