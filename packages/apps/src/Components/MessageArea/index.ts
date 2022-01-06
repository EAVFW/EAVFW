/**
 * A shared export for all types, functions and classes needed to use the MessageArea and add/remove messages.
 * This is only here for making the import statements cleaner, when using MessageArea.
 */
import MessageArea, { MessagesContext, MessagesProvider, useMessageContext, MessageProps, errorMessageFactory, successMessageFactory } from './MessageContext'

export default MessageArea;
export { MessagesContext, MessagesProvider, useMessageContext, errorMessageFactory, successMessageFactory, MessageArea };
export type { MessageProps };
