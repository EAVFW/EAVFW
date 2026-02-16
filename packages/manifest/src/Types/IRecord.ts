/** Base record type returned by EAVFW API queries. Every record has an `id`. */
export type IRecord = {
  name?: string;
  entityName?: string;
  id: string;
  [name: string]: unknown;
};
