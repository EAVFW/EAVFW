
import { AttributeDefinition, NestedType } from '@eavfw/manifest';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';


export const createAttribute = (displayName: string, description: string, type: NestedType, extensions = {}) => ({

    displayName: displayName,
    description: description,
    schemaName: displayName.replace(/\s/g, ''),
    logicalName: displayName.toLowerCase().replace(/\s/g, ''),
    type: type,
    ...extensions

});
export const addAttributeLocale = (attribute: AttributeDefinition, locale_1030: string, locale_description_1030?: string) => ({
    ...attribute,
    "locale": {
        "1030": {
            "displayName": locale_1030,
            "description": locale_description_1030
        }
    }
});

export const createTabReference = (tab = "TAB_Quick", column = "COLUMN_First", section = "SECTION_General") => (
    {
        tab,
        column,
        section
    }
)
export const createLocaledTitle = (title = "General Information", locale = "1030") => ({
    [locale]: {
        "title": title
    }
})
export const createLayoutSection = (SECTION_KEY = "SECTION_General", SECTION: any = {}) => [SECTION_KEY, SECTION];

export const createColumn = (key = "COLUMN_First", ...sections: any[]) => [key, {
    "sections": Object.fromEntries(sections)
}];

export const createTabLayout = (title = "General Information", locale: any = null, ...columns: any[]) => (
    {
        "title": title,
        "locale": locale,
        "columns": Object.fromEntries(columns)
    });
