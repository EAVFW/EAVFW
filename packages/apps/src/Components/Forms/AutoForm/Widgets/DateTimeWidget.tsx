import {
  WidgetProps,
  getTemplate,
  localToUTC,
  utcToLocal,
  StrictRJSFSchema,
  RJSFSchema,
  FormContextType,
} from '@rjsf/utils';

function DateTimeWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: WidgetProps<T, S, F>) {
  const { registry } = props;
  const uiProps = (props.options['props'] as Record<string, unknown>) || {};
  const options = {
    ...props.options,
    props: {
      type: 'datetime-local',
      ...uiProps,
    },
  };
  const BaseInputTemplate = getTemplate<'BaseInputTemplate', T, S, F>(
    'BaseInputTemplate',
    registry,
    options,
  );

  const value = utcToLocal(props.value);
  const onChange = (value: string) => {
    props.onChange(localToUTC(value));
  };
  // TODO: rows and columns.
  return <BaseInputTemplate {...props} options={options} value={value} onChange={onChange} />;
}

/** @deprecated Use named import: `import { DateTimeWidget } from '...'` instead of default import */
export default DateTimeWidget;
export { DateTimeWidget };
