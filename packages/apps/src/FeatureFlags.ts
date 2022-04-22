import { FormDefinition } from "@eavfw/manifest";
import { Theme } from "@fluentui/react";
import { features } from "process";
import { throwIfNotDefined } from "../../utils/src";
import { FormsConfig } from "./FormsConfig";
import { AppPickerLayout, EmptyLayout, FormLayout, PageLayout, RootLayout } from "./Layouts";



const Features: {
    useEvaluateFormDefinition: (form: FormDefinition, formdata: any) => { evaluatedForm: FormDefinition, isEvaluatedFormLoading: boolean }
    formsConfig: FormsConfig,
    defaultTheme?: Theme,
    topBarTheme?: Theme,
    "RootLayout": typeof RootLayout,
    "EmptyLayout": typeof EmptyLayout,
    "PageLayout": typeof PageLayout,
    "AppPickerLayout": typeof AppPickerLayout,
    "FormLayout": typeof FormLayout
} = {
    useEvaluateFormDefinition: (form, data) => ({ evaluatedForm: form, isEvaluatedFormLoading:false }),
    formsConfig: {  
        alwaysShowFormSelector: false
    },
    RootLayout: RootLayout,
    FormLayout: FormLayout,
    AppPickerLayout: AppPickerLayout,
    PageLayout: PageLayout,
    EmptyLayout: EmptyLayout

};

/**
 * Resolves a feature from the IOC Container
 * @param name
 * @param throwIfNotRegistered
 */

export function ResolveFeature<T extends keyof typeof Features>(name: T, throwIfNotRegistered = true) {
    console.log(`resolving feature '${name}' from ${Object.keys(Features).join(',')}`);
    const value = Features[name] as Required<typeof Features>[T];

    if (throwIfNotRegistered)
        return throwIfNotDefined(value, `'${name}' has not been registered`);
    return value;
}

/**
 * Registers a feature in the IOC Container
 * @param name
 * @param view
 */


export function RegisterFeature<T extends keyof typeof Features>(name: T, view: Required<typeof Features>[T]) {
    Features[name] = view;
}
