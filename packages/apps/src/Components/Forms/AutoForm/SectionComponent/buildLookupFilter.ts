import { ViewReference } from '@eavfw/manifest';
import { trimId, padId } from './sectionUtils';

export function buildLookupFilter(entityName: string, id: string, gridprops: ViewReference) {
  if (gridprops.polylookup === 'split')
    return (
      `$filter=${gridprops.entityName}${entityName}references/any(ref: ref/${entityName}id eq ${id})` +
      (gridprops.filter ? ' and ' + gridprops.filter : '')
    );

  return (
    `$filter=${gridprops.attributeType === 'lookup' || gridprops.inlinePolyLookup ? gridprops.attribute : `${trimId(gridprops.attribute)}/${padId(entityName)}`} eq ${id}` +
    (gridprops.filter ? ' and ' + gridprops.filter : '')
  );
}
