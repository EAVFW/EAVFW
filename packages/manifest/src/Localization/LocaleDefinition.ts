type BaseLocaleDefinition = {
    displayName: string;
    description?: string;
};

export type EntityLocaleDefinition = BaseLocaleDefinition & {
    pluralName: string;
};

export type DashboardLocaleDefinition = BaseLocaleDefinition;