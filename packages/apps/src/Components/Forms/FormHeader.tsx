import { Tab, TabList } from "@fluentui/react-components";
import { useTabProvider } from "./Tabs";
import { EntityDefinition, FormDefinition, FormTabDefinition } from "@eavfw/manifest";
import FormSelectorComponent from "./FormSelectorComponent";
import { useSectionStyles } from "../../Styles/SectionStyles.styles";
import { IDropdownOption, Stack } from "@fluentui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useModelDrivenApp } from "../../useModelDrivenApp";

export const FormHeader = ({ form, record, entity, entityName, locale, formName, getTabName,tabs }: {tabs:string[], getTabName: (tab: FormTabDefinition) => string, form: FormDefinition, record: any, entity: EntityDefinition, entityName: string, locale: string, formName: string }) => {

    const app = useModelDrivenApp();
    const { onTabChange, tabName = Object.keys(form?.layout?.tabs ?? {})[0] } = useTabProvider();
    const styles = useSectionStyles();
    const forms = entity?.forms ?? {};
    const hasMoreForms = Object.keys(forms).filter(f => forms[f].type === "Main").length > 1;
    const primaryField = useMemo(() => Object.values(app.getAttributes(entityName)).find((a) => a.isPrimaryField)!, [entityName]);
    const primaryFieldValue = useMemo(() => record[primaryField?.logicalName], [primaryField, entityName]);
     
    const [selectedForm, setselectedForm] = useState(formName ?? Object.keys(entity.forms ?? {})[0]);

  

    //const first = useRef(true);
    //useEffect(() => {
    //    if (first.current) {
    //        first.current = false;
    //        return;
    //    }
    //    const newTabs = Object.keys(form?.layout.tabs ?? {});
    //    if (newTabs.length !== tabs.length || tabs.some((value, index) => newTabs[index] !== value)) {
    //        setTabs(newTabs);
    //    }
    //}, [form]);

    const _onChangeForm = useCallback((
        event: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption,
        index?: number
    ) => {
        setselectedForm(option?.key as string);
    }, []);

    return (<>
        { form?.type !== "QuickCreate" && <Stack.Item className={styles.section} styles={{ root: { marginLeft: 15, paddingTop: 8 } }}>
            <h2>{primaryFieldValue}</h2>
            <Stack horizontal style={{ alignItems: "center" }}>
                <h3 style={{ height: "28px" }}>{entity.locale?.[locale]?.displayName ?? entity.displayName}</h3>
                {hasMoreForms && (
                    <FormSelectorComponent
                        onChangeView={_onChangeForm}
                        selectedForm={selectedForm}
                        entity={entity}
                        styles={{ root: { padding: 0 } }}
                    />
                )}
            </Stack>
            <TabList selectedValue={tabName} onTabSelect={(e, data) => onTabChange(data.value as string)}>
                {tabs.filter(tabName => form.layout.tabs[tabName]).map(tabName => {
                    const tab = form.layout.tabs[tabName];
                    return (
                        <Tab id={tabName} value={tabName} key={tabName} >
                            {getTabName(tab) ?? tabName}
                        </Tab>
                    )
                })}

            </TabList>
        </Stack.Item>
                }
    </>)
}