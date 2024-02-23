
import { useRouter } from 'next/router';
import { PropsWithChildren, useEffect } from 'react';
import { useState } from 'react';
import { TabContext } from './TabContext';

export const RouterTabProvider: React.FC<PropsWithChildren<{ defaultTabs?: string[] }>> = ({ defaultTabs=[], children }) => {

    const router = useRouter();
    const [tabs, setTabs] = useState(defaultTabs);
    const [tabName, setSelectedTab] = useState<string>(router.query.tabName as string);
    const onTabChange = (tabName:string) => {

        router!.query.tabName = tabName;
        router!.replace(router!, undefined, { shallow: true });
        setSelectedTab(tabName);
    }

    useEffect(() => {
        if (tabName != router.query.tabName)
            setSelectedTab(router.query.tabName as string)
    }, [tabName, router.query.tabName]);

    return <TabContext.Provider value={{ tabName, onTabChange, tabs,setTabs }}> {children} </TabContext.Provider>
}