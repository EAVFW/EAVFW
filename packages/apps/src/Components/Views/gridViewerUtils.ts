import { IColumn } from '@fluentui/react';

import { EntityDefinition, IRecord, queryEntitySWR } from '@eavfw/manifest';

import { IFetchQuery } from './PagingContext';

/**
 * Sets the $count parameter on a fetch query.
 * @param fetchQuery - The fetch query to modify.
 * @param count - Whether to include count. Defaults to true.
 * @returns The modified fetch query or the original if unchanged.
 */
export function setCount(fetchQuery?: IFetchQuery, count = true) {
  if (fetchQuery) {
    const clone = { ...fetchQuery } as IFetchQuery;
    if (clone['$count'] !== count) {
      clone['$count'] = count;
      return clone;
    }
  }
  return fetchQuery;
}

/**
 * Sets the $top parameter on a fetch query.
 * @param fetchQuery - The fetch query to modify.
 * @param top - The number of records to return. Defaults to 100.
 * @returns The modified fetch query or the original if unchanged.
 */
export function setTop(fetchQuery?: IFetchQuery, top = 100) {
  if (fetchQuery) {
    const clone = { ...fetchQuery } as IFetchQuery;
    if (clone['$top'] !== top) {
      clone['$top'] = top;
      return clone;
    }
  }
  return fetchQuery;
}

/**
 * Sets the $skip parameter on a fetch query.
 * @param fetchQuery - The fetch query to modify.
 * @param skip - The number of records to skip. Defaults to 0.
 * @returns The modified fetch query or the original if unchanged.
 */
export function setSkip(fetchQuery?: IFetchQuery, skip = 0) {
  if (fetchQuery) {
    const clone = { ...fetchQuery } as IFetchQuery;
    if (clone['$skip'] !== skip) {
      clone['$skip'] = skip;
      return clone;
    }
  }
  return fetchQuery;
}

/**
 * Default data query function for the grid viewer.
 * Fetches entity records using SWR with the given fetch query.
 */
export const DefaultDataQuery = (
  entity: EntityDefinition,
  newRecord?: boolean,
  fetchQuery?: IFetchQuery,
) => {
  return queryEntitySWR(
    entity,
    setCount(fetchQuery, false) as Record<string, string> | undefined,
    !newRecord && typeof fetchQuery !== 'undefined',
  );
};

/**
 * Default data count query function for the grid viewer.
 * Fetches the record count using SWR with the given fetch query.
 */
export const DefaultDataCountQuery = (
  entity: EntityDefinition,
  newRecord?: boolean,
  fetchQuery?: IFetchQuery,
) => {
  return queryEntitySWR(
    entity,
    setSkip(setTop(setCount(fetchQuery, true), 0), 0) as Record<string, string> | undefined,
    !newRecord && typeof fetchQuery !== 'undefined',
  );
};

/**
 * Default fetch query builder (identity function).
 */
export const DefaultOnBuildFetchQuery = <T>(q: T) => q;

/**
 * Returns a unique key for a grid item.
 */
export function _getKey(item: IRecord, index?: number): string {
  return item.key as string;
}

/**
 * Retrieves the text content of a cell based on the provided item and column information.
 * @param item The data item representing a row.
 * @param column The column information object.
 * @returns The text content to be displayed in the cell.
 */
export const getCellText = (item: IRecord, column: IColumn): string => {
  // Get the value from the item's property specified by the column's fieldName.
  let value = item && column && column.fieldName ? item[column.fieldName] : '';

  // Handle null or undefined values by setting them to an empty string.
  if (value === null || value === undefined) {
    value = '';
  }

  // Convert boolean values to string representation.
  if (typeof value === 'boolean') {
    return value.toString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  // Convert and format the value as a date and time string.
  return String(value);
};

/**
 * Converts a SQL DateTime format to the format DD-MM-YYYY HH:MM:SS.
 * @param inputDateTime The input date and time in SQL DateTime format.
 * @returns The formatted date and time string in DD-MM-YYYY HH:MM:SS format.
 */
export function convertDateTimeFormat(inputDateTime: string): string {
  if (inputDateTime != undefined) {
    const inputDate = new Date(inputDateTime);

    const day = String(inputDate.getDate()).padStart(2, '0');
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const year = inputDate.getFullYear();

    const hours = String(inputDate.getHours()).padStart(2, '0');
    const minutes = String(inputDate.getMinutes()).padStart(2, '0');
    const seconds = String(Math.round(inputDate.getSeconds())).padStart(2, '0');

    const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    return formattedDateTime;
  } else {
    return inputDateTime;
  }
}
