import { EntityDefinition } from '@eavfw/manifest';

/**
 * Default Identity entity definition used in the fallback manifest.
 *
 * Defines the external Identity entity with standard audit attributes
 * (Owner, Created By, Modified By, Created On, Modified On, Row Version).
 */
export const defaultIdentityEntity = {
  pluralName: 'Identities',
  external: true,
  schema: 'KFST',
  attributes: {
    Name: {
      isPrimaryField: true,
      displayName: 'Name',
      schemaName: 'Name',
      logicalName: 'name',
      type: {
        type: 'string',
      },
      locale: {
        '1030': {
          displayName: 'Navn',
        },
      },
    },
    Id: {
      isPrimaryKey: true,
      type: {
        type: 'guid',
      },
      displayName: 'Id',
      schemaName: 'Id',
      logicalName: 'id',
      locale: {
        '1030': {
          displayName: 'Id',
        },
      },
    },
    'Modified On': {
      locale: {
        '1030': {
          displayName: 'Ændret',
        },
        '1033': {
          displayName: 'Modified On',
        },
      },
      type: {
        type: 'DateTime',
        required: true,
      },
      displayName: 'Modified On',
      schemaName: 'ModifiedOn',
      logicalName: 'modifiedon',
    },
    'Created On': {
      locale: {
        '1030': {
          displayName: 'Oprettet',
        },
        '1033': {
          displayName: 'Created On',
        },
      },
      type: {
        type: 'DateTime',
        required: true,
      },
      displayName: 'Created On',
      schemaName: 'CreatedOn',
      logicalName: 'createdon',
    },
    Owner: {
      locale: {
        '1030': {
          displayName: 'Ejer',
        },
        '1033': {
          displayName: 'Owner',
        },
      },
      type: {
        type: 'lookup',
        referenceType: 'Identity',
        required: true,
        foreignKey: {
          principalTable: 'identity',
          principalColumn: 'id',
          principalNameColumn: 'name',
          name: 'owner',
        },
      },
      displayName: 'Owner',
      schemaName: 'OwnerId',
      logicalName: 'ownerid',
    },
    'Modified By': {
      locale: {
        '1030': {
          displayName: 'Ændret af',
        },
        '1033': {
          displayName: 'Modified By',
        },
      },
      type: {
        type: 'lookup',
        referenceType: 'Identity',
        required: true,
        foreignKey: {
          principalTable: 'identity',
          principalColumn: 'id',
          principalNameColumn: 'name',
          name: 'modifiedby',
        },
      },
      displayName: 'Modified By',
      schemaName: 'ModifiedById',
      logicalName: 'modifiedbyid',
    },
    'Created By': {
      locale: {
        '1030': {
          displayName: 'Oprettet af',
        },
        '1033': {
          displayName: 'Created By',
        },
      },
      type: {
        type: 'lookup',
        referenceType: 'Identity',
        required: true,
        foreignKey: {
          principalTable: 'identity',
          principalColumn: 'id',
          principalNameColumn: 'name',
          name: 'createdby',
        },
      },
      displayName: 'Created By',
      schemaName: 'CreatedById',
      logicalName: 'createdbyid',
    },
    'Row Version': {
      type: {
        type: 'binary',
      },
      isRowVersion: true,
      displayName: 'Row Version',
      schemaName: 'RowVersion',
      logicalName: 'rowversion',
      locale: {
        '1033': {
          displayName: 'Row Version',
        },
      },
    },
  },
  displayName: 'Identity',
  schemaName: 'Identity',
  logicalName: 'identity',
  collectionSchemaName: 'Identities',
  locale: {
    '1030': {
      displayName: 'Identitet',
      pluralName: 'Identiteter',
    },
  },
} as unknown as EntityDefinition;
