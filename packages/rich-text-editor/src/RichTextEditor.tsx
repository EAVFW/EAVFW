import React, { useMemo, useState } from "react";
import { EditorProps } from "react-draft-wysiwyg";
import { FieldProps } from "@rjsf/utils";
import dynamic from "next/dynamic";
import { ContentState, convertFromHTML, convertToRaw, EditorState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import striptags from "striptags";
// This is needed for the react-draft-wysiwyg package, otherwise the `Editor` component is rendered wrong.
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { RegistereControl, useModelDrivenApp } from "@eavfw/apps";
import { useTheme } from "@fluentui/react";

// We have to do this, because the package expects some objects to exist which only exist client-side.
const Editor = dynamic<EditorProps>(() => import("react-draft-wysiwyg").then((mod) => mod.Editor), { ssr: false });

const htmlToContentState = (html: string) => {
    const { contentBlocks, entityMap } = convertFromHTML(html);
    return ContentState.createFromBlockArray(contentBlocks, entityMap);
};

export const htmlToPlainText = (htmlText: string) => htmlToContentState(htmlText).getPlainText().replaceAll("\n", " ");

const htmlToEditorState = (html: string) => EditorState.createWithContent(htmlToContentState(html));

export type RichTextEditorProps = {
    onChange: FieldProps["onChange"];
    value: any;
    alwaysVisible?: boolean,
    styles?: any,
};

export const RichTextEditor: React.VFC<RichTextEditorProps> = ({ alwaysVisible, onChange, value, styles }) => {
    console.groupCollapsed("RichTextEditor");
    try {
        // console.log("props:\n", props);
        const theme = useTheme();
        // const { value } = props;
        const app = useModelDrivenApp();
        const placeholder = app.getLocalization("Write something here...") ?? "Write something here...";
        const loadedValue: string | undefined = value;

        // Only set `editorState` if a value was found on the `formData`, this allows us to use placeholder text.
        const [editorState, setEditorState] = useState(loadedValue !== undefined ? htmlToEditorState(loadedValue) : undefined);
        const [visisble, setVisisble] = useState(alwaysVisible || false);
        const onEditorStateChange: NonNullable<EditorProps["onEditorStateChange"]> = (editorState) => {
            try {
                console.groupCollapsed("RichTextEditor::onEditorStateChange");

                setEditorState(editorState);
                const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));
                console.log("content:\n", [content, striptags(content)]);

                if (striptags(content).trim()) {

                    onChange(content);
                } else {
                    onChange(undefined);
                }
            } finally {
                console.groupEnd();
            }
        };
        const editorStyle = useMemo(() => ({ padding: "5px", border: "1px solid #F1F1F1", borderRadius: "2px", ...(styles?.editor ?? {}) }), [Object.values(styles?.editor ?? {})]);

        console.groupEnd();
        return (
            <Editor wrapperClassName="rdw-editor-wrapper-buttom" onFocus={() => setVisisble(alwaysVisible || true)} onBlur={() => setVisisble(alwaysVisible || false)}
                toolbarHidden={!visisble}
                wrapperStyle={{ backgroundColor: "white", borderWidth: 1, borderStyle: "solid", borderColor: theme?.palette.black }}
                editorStyle={editorStyle}
                placeholder={placeholder}
                editorState={editorState}
                onEditorStateChange={onEditorStateChange}
            />
        );
    } finally {
        console.groupEnd();
    }
};

export default RichTextEditor;

RegistereControl("RichTextEditor", RichTextEditor);