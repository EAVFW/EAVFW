import { PivotItem } from '@fluentui/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useState } from 'react';
import { TabContext } from './TabContext';

export const RouterTabProvider: React.FC = ({ children }) => {

    const router = useRouter();

    const [tabName, setSelectedTab] = useState<string>(router.query.tabName as string);
    const onTabChange = (e?: PivotItem, ee?: any) => {

        router!.query.tabName = e?.props.itemKey;
        router!.replace(router!, undefined, { shallow: true });
        setSelectedTab(e?.props.itemKey!);
    }

    useEffect(() => {
        if (tabName != router.query.tabName)
            setSelectedTab(router.query.tabName as string)
    }, [tabName, router.query.tabName]);

    return <TabContext.Provider value={{ tabName, onTabChange }}> {children} </TabContext.Provider>
}