import { AttributeDefinition, NestedType } from '@eavfw/manifest';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Creates an attribute definition with auto-derived `schemaName` and
 * `logicalName` from the display name.
 *
 * @param displayName - Human-readable attribute name.
 * @param description - Attribute description.
 * @param type - The attribute's nested type definition.
 * @param extensions - Optional extra properties merged into the result.
 * @returns A partial {@link AttributeDefinition}.
 *
 * @example
 * ```ts
 * const attr = createAttribute('Account Name', 'Primary name', { type: 'string' });
 * ```
 */
export const createAttribute = (
  displayName: string,
  description: string,
  type: NestedType,
  extensions = {},
) => ({
  displayName: displayName,
  description: description,
  schemaName: displayName.replace(/\s/g, ''),
  logicalName: displayName.toLowerCase().replace(/\s/g, ''),
  type: type,
  ...extensions,
});

/**
 * Adds Danish (locale 1030) localization to an existing attribute definition.
 *
 * @param attribute - The attribute to localize.
 * @param locale_1030 - Danish display name.
 * @param locale_description_1030 - Optional Danish description.
 * @returns A new attribute definition with the locale merged in.
 */
export const addAttributeLocale = (
  attribute: AttributeDefinition,
  locale_1030: string,
  locale_description_1030?: string,
) => ({
  ...attribute,
  locale: {
    '1030': {
      displayName: locale_1030,
      description: locale_description_1030,
    },
  },
});

/**
 * Creates a tab/column/section reference for placing an attribute on a form.
 *
 * @param tab - Tab key (default `'TAB_Quick'`).
 * @param column - Column key (default `'COLUMN_First'`).
 * @param section - Section key (default `'SECTION_General'`).
 * @returns A `{ tab, column, section }` object.
 */
export const createTabReference = (
  tab = 'TAB_Quick',
  column = 'COLUMN_First',
  section = 'SECTION_General',
) => ({
  tab,
  column,
  section,
});

/**
 * Creates a locale object for a tab title.
 *
 * @param title - The tab title text.
 * @param locale - Locale code (default `'1030'`).
 */
export const createLocaledTitle = (title = 'General Information', locale = '1030') => ({
  [locale]: {
    title: title,
  },
});

/**
 * Creates a `[key, value]` entry for use with `Object.fromEntries` when
 * building a sections map.
 *
 * @param SECTION_KEY - Section identifier.
 * @param SECTION - Section definition.
 */
export const createLayoutSection = (
  SECTION_KEY = 'SECTION_General',
  SECTION: Record<string, unknown> = {},
) => [SECTION_KEY, SECTION];

/**
 * Creates a `[key, { sections }]` entry for use with `Object.fromEntries`
 * when building a columns map.
 *
 * @param key - Column identifier.
 * @param sections - Section entries (from {@link createLayoutSection}).
 */
export const createColumn = (
  key = 'COLUMN_First',
  ...sections: [string, Record<string, unknown>][]
) => [
  key,
  {
    sections: Object.fromEntries(sections),
  },
];

/**
 * Creates a complete form tab layout with title, locale, and columns.
 *
 * @param title - Tab title.
 * @param locale - Locale overrides (or `null`).
 * @param columns - Column entries (from {@link createColumn}).
 */
export const createTabLayout = (
  title = 'General Information',
  locale: Record<string, { title: string }> | null = null,
  ...columns: [string, { sections: Record<string, unknown> }][]
) => ({
  title: title,
  locale: locale,
  columns: Object.fromEntries(columns),
});
