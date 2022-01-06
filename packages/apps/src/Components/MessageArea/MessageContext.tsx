import { useModelDrivenApp } from "@eavfw/apps";
import { MessageBar, MessageBarType } from "@fluentui/react";
import React, {useContext, useState} from "react";


type ContextType = {
    messages: { [key: string]: (props?: {[prop: string]: any}) => JSX.Element },
    addMessage: (key: string, messageRender: messageRenderType) => void,
    removeMessage: (key: string) => void
};

type messageRenderType = (props?: { [prop: string]: any }) => JSX.Element;


/**
 * Returns and renders the MessageArea which lists the messages
 * @constructor
 */
function MessageArea(): JSX.Element {

    const {messages} = useMessageContext();

    console.log("MessageArea", messages, typeof messages);
    return (
        <>
            {Object.keys(messages).map((v,i) => <div key={`messagearea-${i}-${v}`}>{messages[v]({})}</div>)}
        </>
    );
}

/**
 * Interface used to add messages to the message state
 * Extend this interface to make the props StronglyTyped.
 */
interface MessageProps {
    messageContent: JSX.Element,
    props: { [key: string]: { [prop: string]: any } }
}

/**
 * Create the React Context
 */
const MessagesContext = React.createContext<ContextType>({
    messages: {}, addMessage: () => {
    }, removeMessage: () => {
    }
});

/**
 *
 */
function useMessageContext() {
    return useContext(MessagesContext);
}


export function successMessageFactory(factoryProps: { key: string, removeMessage: (key: string) => void }) {
    return (props?: any) => {
        const app = useModelDrivenApp();
        return <MessageBar messageBarType={MessageBarType.success} {...props}
            onDismiss={() => factoryProps.removeMessage(factoryProps.key)}>
            {app.getLocalization('entitySaved') ?? <>Entity have been saved!</>}
        </MessageBar>
    }
}

export function errorMessageFactory(factoryProps: { key: string, removeMessage: (key: string) => void, messages?: string[] }) {
    return (props?: any) => {
        const app = useModelDrivenApp();
        return <MessageBar messageBarType={MessageBarType.error} {...props}
            onDismiss={() => factoryProps.removeMessage(factoryProps.key)}>
            {app.getLocalization('entitySavedErr') ?? <>An error happened!</>}
            {factoryProps.messages?.join("\n")}
        </MessageBar>
    }
}

/**
 * MessagesProvider providers the Context Provider which consumes the components which will need the Messages Context.
 * Components within this provider will be able to add and remove messages to be displayed in the MessageArea.
 * @param props
 * @constructor
 */
const MessagesProvider = (props: any) => {

    let initialState: { [key: string]: messageRenderType } = {};
    const [messages, setMessages] = useState(initialState);

    let addMessage = function (
        key: string,
        messageRender: messageRenderType): void {
        console.log('addMessage', messageRender);
        setMessages(prevState => ({
            ...prevState,
            [key]: messageRender
        }));
    };

    let removeMessage = function (key: string): void {
        setMessages(prevState => {
            let tState = {...prevState};
            delete tState[key];
            return tState;
        })
    };

    return (
        <MessagesContext.Provider value={{messages, addMessage, removeMessage}}>
            {props.children}
        </MessagesContext.Provider>
    );
};

export default MessageArea;
export {MessagesContext, MessagesProvider, useMessageContext};
export type {MessageProps};
