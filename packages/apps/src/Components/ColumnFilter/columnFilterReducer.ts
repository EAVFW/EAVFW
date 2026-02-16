import { Reducer } from 'react';
import {
  AttributeDefinition,
  isAttributeLookup,
  LookupAttributeDefinition,
  ViewDefinition,
} from '@eavfw/manifest';
import {
  IColumn,
  IDetailsColumnProps,
  IRenderFunction,
  mergeStyleSets,
  Target,
} from '@fluentui/react';
import cloneDeep from 'clone-deep';
import { IColumnData } from './IColumnData';
import { ColumnOrder } from './ColumnOrder';
import { ModelDrivenApp } from '../../ModelDrivenApp';
import { UserProfile } from '../Profile';
import { filterRoles } from '../../filterRoles';

export interface IColumnFilterContext {
  menuTarget?: Target;
  isCalloutVisible: boolean;
  currentColumn?: IColumn;
  columns: IColumn[];
  user?: UserProfile;
}

export type ColumnFilterAction =
  | {
      type: 'openFilter';
      target: Target;
      column: IColumn;
    }
  | {
      type: 'closeFilter';
    }
  | {
      type: 'setCurrentColumnFilter';
      filter?: IColumnData;
    }
  | {
      type: 'sortCurrentColumn';
      order: ColumnOrder;
    }
  | {
      type: 'initializeColumns';
      view?: ViewDefinition;
      app: ModelDrivenApp;
      attributes: {
        [key: string]: AttributeDefinition;
      };
      locale: string;
      onHeaderRender?: IRenderFunction<IDetailsColumnProps>;
      dispatch: ColumnFilterDispatch;
    };

export type ColumnFilterDispatch = (action: ColumnFilterAction) => void;

const classNames = mergeStyleSets({
  cell: {
    alignSelf: 'center',
  },
});

export const columnFilterReducer: Reducer<IColumnFilterContext, ColumnFilterAction> = (
  state,
  action,
) => {
  switch (action.type) {
    case 'openFilter':
      return {
        ...state,
        menuTarget: action.target,
        currentColumn: action.column,
        isCalloutVisible: true,
      };
    case 'closeFilter':
      return {
        ...state,
        menuTarget: undefined,
        isCalloutVisible: false,
        currentColumn: undefined,
      };
    case 'setCurrentColumnFilter': {
      const columns = cloneDeep(state.columns);
      const currentColumn = cloneDeep(state.currentColumn);
      if (currentColumn == null) {
        return state;
      }

      const currentIndex = columns.findIndex((x) => x.key === currentColumn.key);
      currentColumn.data['columnFilter'] = action.filter;
      if (action.filter !== undefined) {
        currentColumn.iconName = 'Filter';
      } else {
        currentColumn.iconName = undefined;
      }
      columns[currentIndex] = currentColumn;

      return {
        ...state,
        currentColumn,
        columns,
      };
    }
    case 'sortCurrentColumn': {
      const columns = cloneDeep(state.columns);
      const currentColumn = cloneDeep(state.currentColumn);
      if (currentColumn == null) {
        return state;
      }

      columns.forEach((newCol: IColumn) => {
        const isCurrent = newCol.key === currentColumn.key;
        newCol.isSorted = isCurrent;
        if (isCurrent) {
          newCol.isSortedDescending = action.order === ColumnOrder.Down;
        }
      });

      const currentIndex = columns.findIndex((x) => x.key === currentColumn.key);
      return {
        ...state,
        columns,
        currentColumn: columns[currentIndex],
      };
    }
    case 'initializeColumns': {
      const { view, attributes, locale, dispatch, onHeaderRender, app } = action;

      const columnKeys = Object.keys(view?.columns ?? {}).filter(
        (c) => c.indexOf('/') || (attributes[c] && !(attributes[c].isPrimaryKey ?? false)),
      );

      function columnDisplayName(column: string) {
        if (column.indexOf('/') !== -1) {
          var parts = column.split('/');
          var navAttributes = attributes;
          var nav = column;
          while (parts.length) {
            nav = parts.shift()!;
            var lookup = navAttributes[nav];
            if (lookup && isAttributeLookup(lookup)) {
              var entity = app.getEntityFromKey(lookup.type.referenceType);

              if (parts.length === 0)
                return entity.locale?.[locale ?? '1033']?.displayName ?? entity.displayName;

              navAttributes = entity.attributes;
              nav = Object.entries(navAttributes).filter((a) => a[1].isPrimaryField)[0]?.[0];
            } else {
              break;
            }
          }
          return (
            navAttributes[nav].locale?.[locale ?? '1033']?.displayName ??
            navAttributes[nav].displayName
          );
        }
        if (!(column in attributes)) throw new Error(`The ${column} does not exists`);

        return (
          attributes[column].locale?.[locale ?? '1033']?.displayName ??
          attributes[column].displayName
        );
      }

      const columns: Array<IColumn> = columnKeys
        .filter(
          (field) =>
            !view?.columns![field]?.roles || filterRoles(view.columns![field]?.roles, state.user),
        )
        .map((column) => ({
          key: column,
          name: view?.columns![column]?.displayName ?? columnDisplayName(column),
          minWidth: 32,
          currentWidth: 32,
          maxWidth: 150,
          fieldName: attributes[column]?.logicalName,
          isResizable: true,
          isCollapsible: true,
          isSorted: typeof view?.columns![column]?.sorted !== 'undefined',
          isSortedDescending: view?.columns![column]?.sorted === 'descending',
          data: Object.assign(
            {},
            attributes[column.indexOf('/') === -1 ? column : column.split('/')[0]],
            view?.columns?.[column] ?? {},
          ),
          iconName: (view?.columns![column]?.iconName ?? attributes[column]?.iconName) as
            | string
            | undefined,
          onColumnClick: (e, c) =>
            dispatch({
              type: 'openFilter',
              column: c,
              target: e.currentTarget,
            }),
          className: classNames.cell,
          onRenderHeader: onHeaderRender,
        }));
      return {
        ...state,
        columns: columns,
      };
    }
  }
};

type AttributeDefinitionEntry = [string, AttributeDefinition];
type LookupAttributeDefinitionEntry = [string, LookupAttributeDefinition];

export function isAttributeLookupEntry(
  entry: AttributeDefinitionEntry,
): entry is LookupAttributeDefinitionEntry {
  const [key, attribute] = entry;
  const type = typeof attribute.type === 'string' ? attribute.type : attribute.type?.type;
  return type === 'lookup' || type === 'polylookup';
}
