import { IColumn } from '@fluentui/react';
import { LookupType, NestedType } from '@eavfw/manifest';
import { ColumnOptions } from './ColumnOptions';

/**
 * Composes the OData filter part for the given column, filterText and filterOption.
 * @param filterValue The input for the filter operation
 * @param filterOption contains, startswith, etc.
 * @param columnKey The column key on which the filter is applied
 */
export function composeOdataFilterExpression(
  filterValue: string | number | boolean | undefined,
  filterOption: ColumnOptions,
  columnKey?: string,
) {
  if (columnKey == null) return;

  const filterValueFormatted =
    typeof filterValue === 'string' ? `\'${filterValue}\'` : `${filterValue}`;

  switch (filterOption) {
    case ColumnOptions.Equals:
      return `${columnKey} ${ColumnOptions.Equals} ${filterValueFormatted}`;
    case ColumnOptions.Contains:
      return `${ColumnOptions.Contains}(${columnKey}, ${filterValueFormatted})`;
    case ColumnOptions.EndsWith:
      return `${ColumnOptions.EndsWith}(${columnKey}, ${filterValueFormatted})`;
    case ColumnOptions.StartsWith:
      return `${ColumnOptions.StartsWith}(${columnKey}, ${filterValueFormatted})`;
    case ColumnOptions.Null:
      return `${columnKey} ${ColumnOptions.Null}`;
    case ColumnOptions.NotNull:
      return `${columnKey} ${ColumnOptions.NotNull}`;
  }
}

/**
 * Composes the OData filter part for the given column, filterText and filterOption.
 * @param filterValue The input for the filter operation
 * @param filterOption contains, startswith, etc.
 * @param column The column on which the filter is applied
 */
export function composeOdataFilterPart(
  filterValue: string | undefined,
  filterOption: ColumnOptions,
  column: IColumn,
): string | undefined {
  if (typeof column.data?.type != 'object')
    return composeOdataFilterExpression(filterValue, filterOption, column.fieldName);

  const columnType = column.data?.type as NestedType;
  switch (columnType.type?.toLowerCase()) {
    case 'text':
    case 'string':
      return composeOdataFilterExpression(filterValue, filterOption, column.fieldName);
    case 'boolean':
      return composeOdataFilterExpression(filterValue === 'true', filterOption, column.fieldName);
    case 'integer':
    case 'decimal':
    case 'choice':
      return composeOdataFilterExpression(
        filterValue === undefined ? undefined : +filterValue,
        filterOption,
        column.fieldName,
      );
    case 'polylookup': {
      const lookup = columnType as LookupType;

      if (lookup.foreignKey == null)
        return composeOdataFilterExpression(filterValue, filterOption, column.fieldName);

      const columnKey = `${lookup.foreignKey.name}`;

      return composeOdataFilterExpression(filterValue, filterOption, columnKey);
    }
    case 'lookup': {
      const lookup = columnType as LookupType;
      if (lookup.foreignKey == null)
        return composeOdataFilterExpression(filterValue, filterOption, column.fieldName);

      const columnKey = `${lookup.foreignKey.name}/${lookup.foreignKey.principalNameColumn}`;

      return composeOdataFilterExpression(filterValue, filterOption, columnKey);
    }
  }
}
