import { JSONSchema7 } from 'json-schema';
import {
  AttributeDefinition,
  ChoicesType,
  ChoiceType,
  EntityDefinition,
  FormColumnDefinition,
  NestedType,
  StringType,
} from '@eavfw/manifest';
import { ModelDrivenApp } from '../../../../ModelDrivenApp';
import { ControlJsonSchema } from '../ControlJsonSchema';
import { enumValuesFactory } from './enumValuesFactory';
import { enumDisplayNameFactory } from './enumDisplayNameFactory';

export function getJsonSchema(
  attribute: AttributeDefinition,
  field: FormColumnDefinition,
  entity: EntityDefinition,
  locale: string = '1033',
  formContext: Record<string, unknown>,
): ControlJsonSchema {
  try {
    const { locale, descriptions } = formContext as {
      locale: string;
      descriptions?: Array<Record<string, unknown>>;
    };
    const descriptionInfo = descriptions?.filter(
      (d: Record<string, unknown>) => d.name === attribute?.logicalName && d.locale == locale,
    )?.[0];
    const description = (descriptionInfo?.description ??
      attribute?.locale?.[locale]?.description ??
      attribute?.description) as string | undefined;

    if (field.schema) {
      return {
        title:
          field.displayName ?? attribute?.locale?.[locale]?.displayName ?? attribute.displayName,

        readOnly: attribute.readonly || field.readonly,
        description: description,
        ...field.schema,
        'x-field': (field.uiSchema?.['ui:field'] as string | undefined) ?? 'ControlHostWidget',
        'x-widget-props': {
          styles: field.styles,
          ...formContext,
        },
        'x-control': typeof field.control === 'object' ? field.control.type : field.control,
      };
    }

    const attributeType = attribute.type;
    const type = typeof attributeType === 'string' ? attributeType : attributeType.type;

    const typeProps = typeof attribute.type === 'object' ? attribute.type : ({} as NestedType);

    const controlType =
      field.control ??
      ((typeProps as Record<string, unknown>)['format'] === 'html'
        ? 'RichTextEditorControl'
        : field.control);

    const defaultProps: ControlJsonSchema = {
      title: field.displayName ?? attribute?.locale?.[locale]?.displayName ?? attribute.displayName,

      readOnly: attribute.readonly || field.readonly,
      description: description,
      ['x-description']: description,
      ['x-control']: typeof controlType === 'object' ? controlType.type : controlType,
      'x-widget': field.visible === false ? 'hidden' : undefined,
      'x-field': field.visible === false ? 'hidden' : undefined,
      'x-logicalname': attribute.logicalName,
      'x-widget-props': {
        placeholder: attribute.readonly ? 'beregnes automatisk ved gem' : undefined,
        disabled: field.disabled,
        rows: field.rows,
        styles: field.styles,
        ...formContext,
      },
    };

    if (formContext.isCreate) {
      defaultProps['default'] = (attribute.default ?? field.default) as JSONSchema7['default'];
    }

    if (field.minLength) {
      defaultProps.minLength = field.minLength;
    }

    if (defaultProps['x-control']) {
      defaultProps['x-field'] = 'ControlHostWidget';

      if (typeof field.control === 'object') {
        defaultProps['x-widget-props']!['x-control-props'] = field.control;
      }
    }

    switch (type) {
      case 'decimal':
        //Fixes https://github.com/rjsf-team/react-jsonschema-form/pull/2497
        return {
          ...defaultProps,
          type: 'number',
        };
      case 'integer':
        //Fixes https://github.com/rjsf-team/react-jsonschema-form/pull/2497
        return {
          ...defaultProps,
          type: 'integer',
        };
      case 'boolean':
        return {
          ...defaultProps,
          type: 'boolean',
        };
      case 'string':
      case 'text':
        return {
          ...defaultProps,
          type: 'string',
          format: (typeProps as StringType).format,
        };

      case 'datetime':
        return {
          ...defaultProps,
          type: 'string',
          format: 'date-time',
        };
      case 'multilinetext':
        return {
          ...defaultProps,
          type: 'string',
          'x-widget': field.visible === false ? 'hidden' : 'textarea',
          'x-widget-props': {
            ...defaultProps['x-widget-props'],
            resizable: false,
            styles: {
              ...((defaultProps['x-widget-props']?.['styles'] as
                | Record<string, unknown>
                | undefined) ?? {}),
              field: {
                ...(((
                  defaultProps['x-widget-props']?.['styles'] as Record<string, unknown> | undefined
                )?.['field'] as Record<string, unknown>) ?? {}),
              },
            },
          },
        };
      case 'choice': {
        let options = (typeProps as ChoiceType).options ?? {};

        return {
          ...defaultProps,
          type: 'number',
          enum: Object.entries(options).map((entry) => enumValuesFactory(entry, locale)),
          enumNames: Object.entries(options).map((entry) => enumDisplayNameFactory(entry, locale)),
        };
      }
      case 'choices': {
        let choices = typeProps as ChoicesType;
        let options = choices.options ?? {};

        return {
          ...defaultProps,
          type: 'array',
          uniqueItems: true,
          'x-field': 'ControlHostWidget',
          'x-control': 'ChoicesControl',
          items: {
            type: 'object',
            properties: {
              [choices.logicalName]: {
                type: 'number',
                enum: Object.values(options),
                enumNames: Object.keys(options),
              },
            },
          },
        };
      }
      default:
        return {
          ...defaultProps,
          type: 'string',
          'x-field': field.visible === false ? 'hidden' : 'ControlHostWidget',
        };
    }
  } finally {
  }
}
