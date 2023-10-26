import { createContext, useContext } from "react";



export type DescriptionComponentProps = {
    descriptionId: string;
    description?: string;
}

export const DefaultDescriptionComponent = ({ description, descriptionId }: DescriptionComponentProps) => {

    if (!description)
        return null;

    return <span id={descriptionId} dangerouslySetInnerHTML={{ "__html": description }}></span>
}

const DescriptionComponentContext = createContext({ renderFunc: DefaultDescriptionComponent });
export const useDescriptionRenderFunc = () => useContext(DescriptionComponentContext);
export const DescriptionComponentProvider = (props: { renderFunc: any, children: any }) => <DescriptionComponentContext.Provider value={props}>{props.children}</DescriptionComponentContext.Provider>;

