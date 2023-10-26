import { TextField } from '@fluentui/react';
import { Field, Input } from '@fluentui/react-components';
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
import { ChangeEvent, FocusEvent, useEffect, useState } from 'react';


// Keys of ITextFieldProps from @fluentui/react
const allowedProps = [
	'multiline',
	'resizable',
	'autoAdjustHeight',
	'underlined',
	'borderless',
	'label',
	'onRenderLabel',
	'description',
	'onRenderDescription',
	'prefix',
	'suffix',
	'onRenderPrefix',
	'onRenderSuffix',
	'iconProps',
	'defaultValue',
	'value',
	'disabled',
	'readOnly',
	'errorMessage',
	'onChange',
	'onNotifyValidationResult',
	'onGetErrorMessage',
	'deferredValidationTime',
	'className',
	'inputClassName',
	'ariaLabel',
	'validateOnFocusIn',
	'validateOnFocusOut',
	'validateOnLoad',
	'theme',
	'styles',
	'autoComplete',
	'mask',
	'maskChar',
	'maskFormat',
	'type',
	'list',
];

export function React8BaseInputTemplate<
	T = any,
	S extends StrictRJSFSchema = RJSFSchema,
	F extends FormContextType = any
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
	multiline, uiSchema
}: BaseInputTemplateProps<T, S, F>) {
	console.log("UIPROPS", [uiSchema, options, value]);
	const inputProps = getInputProps<T, S, F>(schema, type, options);
	const _onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
		onChange(value === '' ? options.emptyValue : value);
	const _onBlur = ({ target: { value } }: FocusEvent<HTMLInputElement>) => onBlur(id, value);
	const _onFocus = ({ target: { value } }: FocusEvent<HTMLInputElement>) => onFocus(id, value);

	const uiProps = options ?? {};
	console.log("UIPROPS", [uiProps, inputProps]);
	return (
		<>
			<TextField
				id={id}
				name={id}
				placeholder={placeholder}
				//@ts-ignore
				label={labelValue(label, hideLabel)}
				autoFocus={autofocus}
				required={required}
				disabled={disabled}
				readOnly={readonly}
				multiline={multiline}
				// TODO: once fluent-ui supports the name prop, we can add it back in here.
				// name={name}
				{...inputProps}
				defaultValue={value || value === 0 ? value : ''}
				onChange={(onChangeOverride as any) || _onChange}
				onBlur={_onBlur}
				onFocus={_onFocus}
				errorMessage={(rawErrors || []).join('\n')}
				list={schema.examples ? examplesId<T>(id) : undefined}
				//@ts-ignore
				{...uiProps}
				aria-describedby={ariaDescribedByIds<T>(id, !!schema.examples)}
			/>
			{Array.isArray(schema.examples) && (
				<datalist id={examplesId<T>(id)}>
					{(schema.examples as string[])
						.concat(schema.default && !schema.examples.includes(schema.default) ? ([schema.default] as string[]) : [])
						.map((example: any) => {
							return <option key={example} value={example} />;
						})}
				</datalist>
			)}
		</>
	);
}



export function React9BaseInputTemplate<
	T = any,
	S extends StrictRJSFSchema = RJSFSchema,
	F extends FormContextType = any
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
	multiline, uiSchema
}: BaseInputTemplateProps<T, S, F>) {
	console.log("UIPROPS", [uiSchema, options, value]);
	const inputProps = getInputProps<T, S, F>(schema, type, options);
	
	const _onBlur = ({ target: { value } }: FocusEvent<HTMLInputElement>) => onBlur(id, value);
	const _onFocus = ({ target: { value } }: FocusEvent<HTMLInputElement>) => onFocus(id, value);

	const [localValue, setLocalValue] = useState<string>(value || value === 0 ? value : '');
	useEffect(() => {

		setLocalValue(old => {
			console.log("uncronlled1", [old, value]);
		return value});
	}, [value]);

	const _onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
		let updatedValue = value === '' ? options.emptyValue : value;
		onChange(updatedValue);
		setLocalValue(old => {
			console.log("uncronlled2", [old, value]);
			return updatedValue
		});
	};

	const uiProps = options ?? {};
	console.log("UIPROPS", [uiProps, inputProps]);
	return (
		<>
			<Input
				id={id}
				name={id}
				placeholder={placeholder}

				autoFocus={autofocus}
				required={required}
				disabled={disabled}
				readOnly={readonly}
				//multiline={multiline}

				// name={name}
				{...inputProps as Omit<typeof inputProps, 'type'>}
				value={localValue}
				onChange={(onChangeOverride as any) || _onChange}
				onBlur={_onBlur}
				onFocus={_onFocus}
				// errorMessage={(rawErrors || []).join('\n')}
				list={schema.examples ? examplesId<T>(id) : undefined}

				{...uiProps}
				aria-describedby={ariaDescribedByIds<T>(id, !!schema.examples)}
			/>
			{Array.isArray(schema.examples) && (
				<datalist id={examplesId<T>(id)}>
					{(schema.examples as string[])
						.concat(schema.default && !schema.examples.includes(schema.default) ? ([schema.default] as string[]) : [])
						.map((example: any) => {
							return <option key={example} value={example} />;
						})}
				</datalist>
			)}
		</>
	);
}
