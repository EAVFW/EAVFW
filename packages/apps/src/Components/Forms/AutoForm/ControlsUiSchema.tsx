import React from 'react';
import { IconButton, IDropdownProps, IIconProps } from '@fluentui/react';
import { FieldTemplateProps, RJSFValidationError, UiSchema } from '@rjsf/utils';
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { mergeDeep } from '@eavfw/utils';

import { ControlJsonSchema, ControlJsonSchemaObject } from './ControlJsonSchema';
import { OptionsFactory } from './OptionsFactory';
import { EAVFWLabel } from './Templates/EAVFWLabel';

function hasCustomControl(
  obj: JSONSchema7Definition,
  type: 'x-widget' | 'x-field',
): obj is JSONSchema7 & { 'x-widget': string; 'x-field': string } {
  return typeof obj === 'object' && type in obj;
}

function getControl(obj: JSONSchema7Definition, type: 'widget' | 'field') {
  let t = ('x-' + type) as 'x-widget' | 'x-field';
  if (hasCustomControl(obj, t)) {
    return obj[t];
  }
}

const emojiIcon: IIconProps = { iconName: 'Clear' };

/** Render Caret Down Icon */
const _onRenderCaretDown = (
  formContext: Record<string, unknown>,
  schema: ControlJsonSchema,
  props?: IDropdownProps,
  originalRender?: Function,
) => {
  const formData = formContext.formData as Record<string, unknown>;
  const logicalName = schema['x-logicalname'] as string;
  const value = formData[logicalName];
  return (
    <>
      {(value || value === 0) && !props?.disabled && (
        <IconButton
          iconProps={emojiIcon}
          title="Clear"
          ariaLabel="Clear"
          style={{ height: 28, margin: 1 }}
          onClick={(e) => {
            (formContext.onFormDataChange as (data: Record<string, unknown>) => void)({
              [logicalName]: null,
            });
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      )}
      {originalRender?.(props)}
    </>
  );
};

function mapUISchema(
  props: Record<string, ControlJsonSchema>,
  formContext: Record<string, unknown>,
) {
  if (typeof props === 'object') {
    const entries = Object.keys(props).map((k) => [
      k,
      {
        'ui:widget': getControl(props[k], 'widget'),
        'ui:field': getControl(props[k], 'field'),
        'ui:options': {
          ...(props[k]['x-widget-props'] ?? {}),
          onRenderCaretDown: _onRenderCaretDown.bind(null, formContext, props[k]),
          onRenderLabel: (p: FieldTemplateProps) =>
            props[k].type === 'boolean' ? (
              <EAVFWLabel {...p} description={props[k]?.description as string | undefined} />
            ) : undefined,
        },
        'ui:emptyValue': null,
      },
    ]);

    return Object.fromEntries(entries);
  }

  return {};
}

/**
 * Extracts a specialized `UiSchema` from the custom Json schema given.
 *
 * It does this by looking for the custom `x-widget` property in the json schema
 * and converts this to a `UiSchema` which says that the given widget should be
 * used for that exact property on the json schema.
 * @param jsonSchema The schema to extract the `UiSchema` from
 * @param options Options which should be given to all widgets
 */
export function getUiSchema(
  jsonSchema: ControlJsonSchemaObject,
  options?: OptionsFactory,
  formContext?: Record<string, unknown>,
): UiSchema {
  const props = jsonSchema.properties;
  const deps = mergeDeep(
    {
      'ui:options': {
        styles: (formContext as Record<string, Record<string, unknown>>)?.section?.styles,
      },
    },
    ...Object.values(jsonSchema.dependencies ?? {})
      .map((c) => {
        const dep = c as {
          oneOf?: Array<{ properties?: Record<string, Record<string, unknown>> }>;
        };
        return (dep.oneOf ?? []).map((o) => mapUISchema(o.properties ?? {}, formContext ?? {}));
      })
      .flat(),
    mapUISchema(props, formContext ?? {}),
  );
  return deps;
}

/**
 * This function is used to customize error and it is used to add localization.
 * @param errors List of Error to transform
 */
export function transformErrors(errors: RJSFValidationError[], uischema?: UiSchema) {
  return errors.map((error) => {
    if (error.name === 'multipleOf') {
      let numberOfDecimals = error.params.multipleOf.toString().split('.')[1]?.length || 0;
      error.message = `Only ${numberOfDecimals} decimal${numberOfDecimals > 1 ? 's' : ''} are allowed.`;
      error.stack = `${error.property}: ${error.message}`;
    }
    return error;
  });
}
