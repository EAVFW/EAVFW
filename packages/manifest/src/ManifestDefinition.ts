
import { LocalizationDefinition } from "./Localization"
import { EntityDefinition } from "./Entities";

export type ManifestDefinition = {
    localization?: { [locale: string]: LocalizationDefinition };
    config: any;
    variables: any;
    apps: any;
    entities: { [entity: string]: EntityDefinition };
    dashboards?: { [dashboard: string]: EntityDefinition }
    errorMessages?: { [locale: string]: { [code: string]: string } }
};