import { PropsWithChildren, useState } from 'react';
import { TabContext } from './TabContext';

export const SessionStorageTabProvider = ({
  children,
  key,
  defaultTabs,
}: PropsWithChildren<{ key: string; defaultTabs: string[] }>) => {
  const [tabName, setSelectedTab] = useState<string>(sessionStorage.getItem(key) ?? '');
  const [tabs, setTabs] = useState(defaultTabs);
  const onTabChange = (tabName: string) => {
    if (tabName) sessionStorage.setItem(key, tabName);
    setSelectedTab(tabName);
  };

  return (
    <TabContext.Provider value={{ tabName, onTabChange, tabs, setTabs }}>
      {' '}
      {children}{' '}
    </TabContext.Provider>
  );
};
