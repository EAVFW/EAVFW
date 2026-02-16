import { useEffect, useRef, useState } from 'react';
import isEqual from 'react-fast-compare';
import { BaseNestedType, EntityDefinition } from '@eavfw/manifest';
import { ModelDrivenApp } from '../../../../ModelDrivenApp';
import { useUserProfile } from '../../../Profile/useUserProfile';
import { filterRoles } from '../../../../filterRoles';
import { ControlJsonSchemaObject } from '../ControlJsonSchema';
import { getDependencySchema } from './getDependencySchema';
import { getJsonSchema } from './getJsonSchema';
import { throwError } from './sectionUtils';

export const useSchema = (
  entityName: string,
  entity: EntityDefinition,
  columns: Record<
    string,
    {
      tab: string;
      column: string;
      section: string;
      roles?: { allowed?: string[] };
      dependant?: string;
    }
  >,
  tabName: string,
  columnName: string,
  sectionName: string,
  app: ModelDrivenApp,
  formName: string,
  formContext: Record<string, unknown>,
) => {
  const [schema, setSchema] = useState<ControlJsonSchemaObject>();

  const lastSchema = useRef<ControlJsonSchemaObject>();

  const user = useUserProfile();
  //const _entity = entity;
  useEffect(() => {
    //   const entity = app.getEntity(entityName);
    const fields = Object.keys(columns)
      .filter(
        (field) =>
          columns[field].tab === tabName &&
          columns[field].column === columnName &&
          columns[field].section === sectionName,
      )
      .filter((field) => !columns[field]?.roles || filterRoles(columns[field]?.roles, user))
      .map((field) => ({
        key: field,
        attributeName: field,
        fieldName: field,
        attribute:
          entity.attributes[field] ??
          (entity.TPT && app.getEntity(entity.TPT)?.attributes[field]) ??
          throwError(
            new Error(`The attribute for ${field} was not defined on ${entity.schemaName}`),
          ),
        field: columns[field],
      }));

    const deps = fields
      .filter((f) => f.field.dependant)
      .map((f) => f.field.dependant!)
      .filter((v, i, a) => a.indexOf(v) === i);
    if (fields.length > 0) {
      const schemaDef: ControlJsonSchemaObject = {
        type: 'object',
        dependencies: Object.fromEntries(
          deps.map((field) => [
            entity.attributes[field!].logicalName,
            getDependencySchema(fields, field, entity, app, formName, formContext),
          ]),
        ),
        required: fields
          .filter((f) => (f.attribute?.type as BaseNestedType)?.required)
          .map((field) => field.attribute.logicalName),
        properties: Object.assign(
          {},
          ...fields
            .filter((f) => !f.field.dependant)
            .map((field) => ({
              [field.attribute?.logicalName ?? field.key]: getJsonSchema(
                field.attribute,
                field.field,
                entity,
                app.locale,
                {
                  entityName: entity.logicalName,
                  fieldName: field.fieldName,
                  attributeName: field.attributeName,
                  formName: formName,
                  ...formContext,
                },
              ),
            })),
        ),
      };

      if (!isEqual(lastSchema.current, schemaDef)) {
        lastSchema.current = schemaDef;
        setSchema(schemaDef);
      }
    }
  }, [columns]);

  return schema;
};
