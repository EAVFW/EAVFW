import { ModelDrivenSitemap } from "./ModelDrivenSitemap";
import { ManifestDefinition } from "@eavfw/manifest";
import { FormsConfig } from "./FormsConfig";

export interface ModelDrivenAppModel {
    sitemap: ModelDrivenSitemap;
    title: string;
    entities: ManifestDefinition["entities"];
    entityMap: { [key: string]: string };
    entityCollectionSchemaNameMap: { [key: string]: string };
    apps: { [key: string]: any };
    config?: {
        pages?: {
            forms?: FormsConfig;
        };
        [name: string]: any;
    };
    localization: ManifestDefinition["localization"];
    errorMessages?: ManifestDefinition["errorMessages"];
}