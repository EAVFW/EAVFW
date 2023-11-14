
export type ViewColumnDefinition = {
    roles?: {
        allowed?: string[];
    };
    displayName?: string;
    useAsCardTitle?: boolean;
    useAsCardSubtitle?: boolean;
    visible?: boolean;
    [key: string]: any;
};