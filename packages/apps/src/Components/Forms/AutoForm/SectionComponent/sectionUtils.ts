import { AutoFormColumnsDefinition } from '@eavfw/manifest';

export function trimId(str: string) {
  if (str.toLowerCase().endsWith('id')) return str.slice(0, -2);
  return str;
}

export function padId(str: string) {
  if (!str.toLowerCase().endsWith('id')) return `${str}id`;
  return str;
}

export function throwError(err: Error) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  throw err;
}

export function findEntry(
  columns: Required<AutoFormColumnsDefinition>['columns'],
  columnName: string,
  sectionName: string,
) {
  if (columnName in columns) {
    let sections = columns[columnName].sections;
    if (sectionName in sections) {
      return sections[sectionName];
    }
  }
}
