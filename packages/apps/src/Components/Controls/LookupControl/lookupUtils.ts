import type {
  IButtonStyles,
  IDropdownStyleProps,
  IDropdownStyles,
  IIconProps,
  IStyleFunction,
} from '@fluentui/react';

export const DUMMY_DATA_KEY = 'dummy';

export const commandback: IButtonStyles = {
  root: {
    padding: 2,
    margin: 2,
  },
  flexContainer: {
    justifyContent: 'center',
  },
};

export const emojiIconClear: IIconProps = { iconName: 'Clear' };
export const emojiIcon: IIconProps = { iconName: 'Add' };
export const _styles: IStyleFunction<IDropdownStyleProps, IDropdownStyles> = (props) => ({});

export function nullIfEmpty<T>(items: T[]): T[] | null {
  if (items) return items.length ? items : null;

  return null;
}

export function returnQueryFilter(
  searchfilter: string | undefined,
  filter: string | undefined,
): { $filter: string } | undefined {
  if (searchfilter && filter)
    //both defined
    return { $filter: searchfilter + ' and ' + filter };

  if (searchfilter && !filter)
    //only searchfilter defined
    return { $filter: searchfilter };

  if (filter && !searchfilter)
    //only filter defined
    return { $filter: filter };

  if (!filter && !searchfilter) return { $filter: '' }; //neither defined
}
