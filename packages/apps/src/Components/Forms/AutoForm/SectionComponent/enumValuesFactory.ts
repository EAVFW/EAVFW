import { JSONSchema7Type } from 'json-schema';

export function enumValuesFactory(data: [string, unknown], locale: string): JSONSchema7Type {
  if (typeof data[1] === 'object' && data[1] !== null) {
    return (data[1] as Record<string, unknown>).value as JSONSchema7Type;
  }
  return data[1] as JSONSchema7Type;
}
