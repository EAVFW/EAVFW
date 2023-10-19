import { IWizardMessages, WizardsDefinition } from "@eavfw/manifest";


export type IWizardAction =
    { action: "setTab"; tabName: string; } |
    { action: "setWizard"; wizard?: [string, WizardsDefinition]; } |
    { action: "moveNext"; trigger:string} |
    { action: "setMessages"; messages: IWizardMessages; } |
    { action: "setTransition"; transition: boolean; } |
    { action: "updateMessage"; messageKey: string; message: string; } |
    { action: "setValues"; values: any; expressionsProvider: (d: any) => any; merge?: boolean; };
