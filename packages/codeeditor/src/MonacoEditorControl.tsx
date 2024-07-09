import React, { useState, useEffect, useCallback, useMemo } from "react";
//import {EditorProps} from "react-draft-wysiwyg";
import { FieldProps } from "@rjsf/utils";
import { JSONSchema7 } from "json-schema";
import { RegistereControl, useModelDrivenApp } from '@eavfw/apps';
import Editor, { DiffEditor, useMonaco, loader, EditorProps, OnMount, OnChange } from "@monaco-editor/react";
import type { editor } from 'monaco-editor';
import { useDebouncer } from "@eavfw/hooks";
import { gzip, ungzip } from "pako";
import { useEAVForm } from "@eavfw/forms";
import { isLookup } from "@eavfw/manifest";
export type MonacoEditorControlProps = {
    onChange: FieldProps["onChange"];
    value: any;
    entityName: string;
    fieldName: string;
    attributeName: string;
    formName: string,
    "x-control-props": { schemas: Array<{ uri: string, schema: JSONSchema7 }> }
};
export const MonacoEditorControl: React.VFC<MonacoEditorControlProps> = ({ entityName, formName, fieldName, "x-control-props": { schemas } = {},
    attributeName, ...props }) => {
    console.groupCollapsed("MonacoEditorControl");
    try {
        console.log("props:\n", props);
        const { value } = props;
        const app = useModelDrivenApp();
        const [height, setHeight] = useState<number>(0);
        const [width, setWidth] = useState<number>(0);
        const entityAttributes = app.getAttributes(entityName);
        const attribute = entityAttributes[attributeName];
        //   const column = app.getEntity(entityName).forms?.[formName]?.columns[fieldName];
        const [data, { onChange: onFormDataChange }] = useEAVForm<any, any, any>((state) => state.formValues);
        console.log("Data", [data, attribute]);
        const _data = useMemo(() => {
            let value = isLookup(attribute.type) ?
                data[attribute.logicalName.slice(0, -2)]?.data
                : data[attribute.logicalName];

            console.log("Updating Manifest Source", value);
            if (value) {
                const manifest = ungzip(new Uint8Array(atob(value).split("").map(function (c) {
                    return c.charCodeAt(0)
                })), { to: "string" }) as string;
                console.log("Updating Manifest Source", manifest);
                return manifest;
            }
        }, [attribute]);
        console.log(_data);
        //   const [manifest,setManifest] = useManifest();
        const editorRef = React.useRef<editor.IStandaloneCodeEditor>();
        //  const wrapperRef = React.useRef<HTMLDivElement>(null);
        const loadedValue: string | undefined = value;
        const div = useCallback((node: HTMLDivElement) => {
            if (node !== null) {
                setHeight((document.querySelector("[role='tabpanel']")?.getBoundingClientRect()?.height ?? 100) - 55);
                setWidth((document.querySelector("[role='tabpanel']")?.getBoundingClientRect()?.width ?? 100) - 40);
            }
        }, []);
        const handleEditorDidMount: OnMount = (editor, monaco) => {
            editorRef.current = editor;
            editor.onDidContentSizeChange(() => {
                // setHeight(Math.max(100, editor.getContentHeight()));
                editor.layout();
            });
        };
        const handleEditorOnChange: OnChange = useDebouncer((value) => {
            if (value) {
                const content = { ...data[attribute.logicalName.slice(0, -2)] ?? { path: `/${data.id}/manifest.json`, container: "manifests", contenttype: "application/json" } };
                content.compressed = true;
                content.data = btoa(String.fromCharCode.apply(null, Array.from(gzip(value))));
                onFormDataChange((props) => { props[isLookup(attribute.type) ? attribute.logicalName.slice(0, -2) : attribute.logicalName] = isLookup(attribute.type) ? content : content.data });
            }
        }, 250, [attribute]);
        const monaco = useMonaco();
        useEffect(() => {
            if (monaco) {
                console.log("here is the monaco isntance:", monaco);
                monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                    validate: true, allowComments: true,
                    schemas: schemas,
                    schemaValidation: "error",
                });
            }
        }, [monaco]);
        // Only set `editorState` if a value was found on the `formData`, this allows us to use placeholder text.
        return (
            <div style={{ height, width }} ref={div}>
                <Editor
                    options={{
                        automaticLayout: true,
                        scrollBeyondLastLine: false
                    }}
                    onChange={handleEditorOnChange}
                    onMount={handleEditorDidMount}
                    defaultLanguage="json"
                    value={_data}
                />
            </div>
        );
    } finally {
        console.groupEnd();
    }
};
export default MonacoEditorControl;

RegistereControl("MonacoEditorControl", MonacoEditorControl);