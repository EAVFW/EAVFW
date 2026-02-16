import { EntityDefinition, ManifestDefinition } from '@eavfw/manifest';
import { defaultIdentityEntity } from './defaultIdentityEntity';
import { defaultDocumentEntity } from './defaultDocumentEntity';

/**
 * Default Form Submission entity definition used in the fallback manifest.
 */
const defaultFormSubmissionEntity = {
  pluralName: 'Form Submissions',
  logicalName: 'formsubmission',
  schemaName: 'FormSubmission',
  collectionSchemaName: 'FormSubmissions',
  readonly: true,
  attributes: {
    Id: {
      isPrimaryKey: true,
      type: {
        type: 'guid',
      },
      readonly: true,
      displayName: 'Id',
      schemaName: 'Id',
      logicalName: 'id',
    },
  },
} as unknown as EntityDefinition;

/**
 * The default manifest definition used when no manifest data is stored on the form record.
 *
 * Contains baseline entity definitions for Identity, Form Submission, and Document
 * that serve as the starting point for manifest-driven forms.
 */
export const defaultManifestDefinition: ManifestDefinition = {
  version: '1.0.0',
  entities: {
    Identity: defaultIdentityEntity,
    'Form Submission': defaultFormSubmissionEntity,
    Document: defaultDocumentEntity,
  },
} as unknown as ManifestDefinition;
