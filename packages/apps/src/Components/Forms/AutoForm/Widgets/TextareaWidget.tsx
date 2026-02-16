import { TextField } from '@fluentui/react';
import { Field, Input, Textarea } from '@fluentui/react-components';
import {
  ariaDescribedByIds,
  BaseInputTemplateProps,
  examplesId,
  labelValue,
  FormContextType,
  getInputProps,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import { ChangeEvent, FocusEvent } from 'react';

export function TextareaWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  id,
  placeholder,
  required,
  readonly,
  disabled,
  label,
  hideLabel,
  value,
  onChange,
  onChangeOverride,
  onBlur,
  onFocus,
  autofocus,
  options,
  schema,
  type,
  rawErrors,
  multiline,
  uiSchema,
}: BaseInputTemplateProps<T, S, F>) {
  const inputProps = getInputProps<T, S, F>(schema, type, options);
  const _onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    onChange(value === '' ? options.emptyValue : value);
  const _onBlur = ({ target: { value } }: FocusEvent<HTMLTextAreaElement>) => onBlur(id, value);
  const _onFocus = ({ target: { value } }: FocusEvent<HTMLTextAreaElement>) => onFocus(id, value);

  const uiProps = options ?? {};
  return (
    <Textarea
      style={{ flexGrow: 1 }}
      id={id}
      name={id}
      placeholder={placeholder}
      autoFocus={autofocus}
      required={required}
      disabled={disabled}
      readOnly={readonly}
      //multiline={multiline}

      // name={name}
      {...(inputProps as Omit<typeof inputProps, 'type'>)}
      value={value || value === 0 ? value : ''}
      // @ts-expect-error -- RJSF onChangeOverride type mismatch with Fluent UI Textarea onChange
      onChange={onChangeOverride || _onChange}
      onBlur={_onBlur}
      onFocus={_onFocus}
      // errorMessage={(rawErrors || []).join('\n')}

      {...uiProps}
      aria-describedby={ariaDescribedByIds<T>(id, !!schema.examples)}
    />
  );
}
