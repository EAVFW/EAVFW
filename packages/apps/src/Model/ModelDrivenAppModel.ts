import { ModelDrivenSitemap } from './ModelDrivenSitemap';
import { ManifestDefinition } from '@eavfw/manifest';
import { FormsConfig } from '../FormsConfig';

export interface ModelDrivenAppModel {
  sitemap: ModelDrivenSitemap;
  title: string;
  entities: ManifestDefinition['entities'];
  dashboards?: ManifestDefinition['dashboards'];
  entityMap: { [key: string]: string };
  entityCollectionSchemaNameMap: { [key: string]: string };
  apps: ManifestDefinition['apps'];
  config?: {
    pages?: {
      forms?: FormsConfig;
    };
    [name: string]: unknown;
  };
  localization: ManifestDefinition['localization'];
  errorMessages?: ManifestDefinition['errorMessages'];
}
