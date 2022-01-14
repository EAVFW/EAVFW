
import React, { useMemo, useContext } from "react";
import { isLookup, ManifestDefinition } from "@eavfw/manifest";
import { useEAVForm } from "./useEAVForm";
import { gzip, ungzip } from "pako";
import { useModelDrivenApp } from "@eavfw/apps";
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target: any, ...sources: any[]): any {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}



export type ValidationExpression = {
    validationexpression: any;
    isEntity: boolean;//wether multiplefiles or not
    attributeKey: string;
}
const addValidation = (manifest: ManifestDefinition, expression: ValidationExpression) => {
    let newmanifest: any = {};
    if (expression.isEntity) {
        newmanifest = {
            ...manifest,
            entities: {
                ...manifest.entities,
                [expression.attributeKey]:
                {
                    ...manifest.entities[expression.attributeKey],
                    validation: expression.validationexpression || undefined
                }
            }
        };
    }
    else {
        newmanifest = {
            ...manifest,
            entities: {
                ...manifest.entities, ["Form Submission"]: {
                    ...manifest.entities["Form Submission"],
                    attributes: {
                        ...manifest.entities["Form Submission"].attributes,
                        [expression.attributeKey]:
                        {
                            ...manifest.entities["Form Submission"].attributes[expression.attributeKey],
                            validation: expression.validationexpression || undefined
                        }
                    }
                }
            }
        };
    }

    console.log("NEWMANIFEST", newmanifest)
    return newmanifest;
}




const manifestcontext = React.createContext<any>({ current: {} });
export type useManifestProps = {
    entityName: string;
    attributeKey: string;
}
export const useManifest: (props: useManifestProps) => [ManifestDefinition, (manifest: ManifestDefinition, merge?: boolean) => void, (expression: ValidationExpression) => void] = ({ attributeKey, entityName }) => {

    const [data, { onChange: onFormDataChange }] = useEAVForm<any,any,any>((state) => state.formValues);
 
    const app = useModelDrivenApp();
    const entity = app.getEntity(entityName);
    const column = entity.attributes[attributeKey];

    const _manifest: ManifestDefinition = useMemo(() => {

        let value = isLookup(column.type) ?
            data[column.logicalName.slice(0, -2)]?.data
            : data[column.logicalName];

        if (value) {
            const manifest = JSON.parse(ungzip(new Uint8Array(atob(value).split("").map(function (c) {
                return c.charCodeAt(0)
            })), { to: "string" }) as string);
            console.log("Updating Manifest Source", manifest);
            return manifest;
        }

        return {
            entities: {
                "Identity": {
                    "pluralName": "Identities",
                    "external": true,
                    "schema": "KFST",
                    "attributes": {
                        "Name": {
                            "isPrimaryField": true,
                            "displayName": "Name",
                            "schemaName": "Name",
                            "logicalName": "name",
                            "type": {
                                "type": "string"
                            },
                            "locale": {
                                "1030": {
                                    "displayName": "Navn"
                                }
                            }
                        },
                        "Id": {
                            "isPrimaryKey": true,
                            "type": {
                                "type": "guid"
                            },
                            "displayName": "Id",
                            "schemaName": "Id",
                            "logicalName": "id",
                            "locale": {
                                "1030": {
                                    "displayName": "Id"
                                }
                            }
                        },
                        "Modified On": {
                            "locale": {
                                "1030": {
                                    "displayName": "Ændret"
                                },
                                "1033": {
                                    "displayName": "Modified On"
                                }
                            },
                            "type": {
                                "type": "DateTime",
                                "required": true
                            },
                            "displayName": "Modified On",
                            "schemaName": "ModifiedOn",
                            "logicalName": "modifiedon"
                        },
                        "Created On": {
                            "locale": {
                                "1030": {
                                    "displayName": "Oprettet"
                                },
                                "1033": {
                                    "displayName": "Created On"
                                }
                            },
                            "type": {
                                "type": "DateTime",
                                "required": true
                            },
                            "displayName": "Created On",
                            "schemaName": "CreatedOn",
                            "logicalName": "createdon"
                        },
                        "Owner": {
                            "locale": {
                                "1030": {
                                    "displayName": "Ejer"
                                },
                                "1033": {
                                    "displayName": "Owner"
                                }
                            },
                            "type": {
                                "type": "lookup",
                                "referenceType": "Identity",
                                "required": true,
                                "foreignKey": {
                                    "principalTable": "identity",
                                    "principalColumn": "id",
                                    "principalNameColumn": "name",
                                    "name": "owner"
                                }
                            },
                            "displayName": "Owner",
                            "schemaName": "OwnerId",
                            "logicalName": "ownerid"
                        },
                        "Modified By": {
                            "locale": {
                                "1030": {
                                    "displayName": "Ændret af"
                                },
                                "1033": {
                                    "displayName": "Modified By"
                                }
                            },
                            "type": {
                                "type": "lookup",
                                "referenceType": "Identity",
                                "required": true,
                                "foreignKey": {
                                    "principalTable": "identity",
                                    "principalColumn": "id",
                                    "principalNameColumn": "name",
                                    "name": "modifiedby"
                                }
                            },
                            "displayName": "Modified By",
                            "schemaName": "ModifiedById",
                            "logicalName": "modifiedbyid"
                        },
                        "Created By": {
                            "locale": {
                                "1030": {
                                    "displayName": "Oprettet af"
                                },
                                "1033": {
                                    "displayName": "Created By"
                                }
                            },
                            "type": {
                                "type": "lookup",
                                "referenceType": "Identity",
                                "required": true,
                                "foreignKey": {
                                    "principalTable": "identity",
                                    "principalColumn": "id",
                                    "principalNameColumn": "name",
                                    "name": "createdby"
                                }
                            },
                            "displayName": "Created By",
                            "schemaName": "CreatedById",
                            "logicalName": "createdbyid"
                        },
                        "Row Version": {
                            "type": {
                                "type": "binary"
                            },
                            "isRowVersion": true,
                            "displayName": "Row Version",
                            "schemaName": "RowVersion",
                            "logicalName": "rowversion",
                            "locale": {
                                "1033": {
                                    "displayName": "Row Version"
                                }
                            }
                        }
                    },
                    "displayName": "Identity",
                    "schemaName": "Identity",
                    "logicalName": "identity",
                    "collectionSchemaName": "Identities",
                    "locale": {
                        "1030": {
                            "displayName": "Identitet",
                            "pluralName": "Identiteter"
                        }
                    }
                },
                "Form Submission": {
                    pluralName: "Form Submissions",
                    logicalName: "formsubmission",
                    schemaName: "FormSubmission",
                    collectionSchemaName: "FormSubmissions",
                    readonly: true,
                    attributes: {
                        "Id": {
                            "isPrimaryKey": true,
                            "type": {
                                "type": "guid"
                            },
                            "readonly": true,
                            "displayName": "Id",
                            "schemaName": "Id",
                            "logicalName": "id"
                        },
                    }
                },
                "Document": {
                    "external": true,
                    "schema": "KFST",
                    "pluralName": "Documents",
                    "locale": {
                        "1030": {
                            "pluralName": "Dokumenter",
                            "displayName": "Dokument"
                        },
                        "1033": {
                            "displayName": "Document",
                            "pluralName": "Documents"
                        }
                    },
                    "sitemap": {
                        "app": "Vanddata",
                        "area": "Administration",
                        "group": "Administration"
                    },
                    "attributes": {
                        "Name": {
                            "isPrimaryField": true,
                            "locale": {
                                "1030": {
                                    "displayName": "Navn"
                                },
                                "1033": {
                                    "displayName": "Name"
                                }
                            },
                            "displayName": "Name",
                            "schemaName": "Name",
                            "logicalName": "name",
                            "type": {
                                "type": "string"
                            }
                        },
                        "Size": {
                            "type": {
                                "type": "integer"
                            },
                            "displayName": "Size",
                            "schemaName": "Size",
                            "logicalName": "size",
                            "locale": {
                                "1033": {
                                    "displayName": "Size"
                                }
                            }
                        },
                        "Container": {
                            "type": {
                                "type": "Text",
                                "maxLength": 100
                            },
                            "displayName": "Container",
                            "schemaName": "Container",
                            "logicalName": "container",
                            "locale": {
                                "1033": {
                                    "displayName": "Container"
                                }
                            }
                        },
                        "Path": {
                            "type": {
                                "type": "Text",
                                "maxLength": 512
                            },
                            "displayName": "Path",
                            "schemaName": "Path",
                            "logicalName": "path",
                            "locale": {
                                "1033": {
                                    "displayName": "Path"
                                }
                            }
                        },
                        "ContentType": {
                            "type": {
                                "type": "Text"
                            },
                            "displayName": "ContentType",
                            "schemaName": "ContentType",
                            "logicalName": "contenttype",
                            "locale": {
                                "1033": {
                                    "displayName": "ContentType"
                                }
                            }
                        },
                        "Data": {
                            "type": {
                                "type": "binary",
                                "format": "File"
                            },
                            "displayName": "Data",
                            "schemaName": "Data",
                            "logicalName": "data",
                            "locale": {
                                "1033": {
                                    "displayName": "Data"
                                }
                            }
                        },
                        "Id": {
                            "isPrimaryKey": true,
                            "type": {
                                "type": "guid"
                            },
                            "displayName": "Id",
                            "schemaName": "Id",
                            "logicalName": "id",
                            "locale": {
                                "1033": {
                                    "displayName": "Id"
                                }
                            }
                        },
                        "Modified On": {
                            "locale": {
                                "1030": {
                                    "displayName": "Ændret"
                                },
                                "1033": {
                                    "displayName": "Modified On"
                                }
                            },
                            "type": {
                                "type": "DateTime",
                                "required": true
                            },
                            "displayName": "Modified On",
                            "schemaName": "ModifiedOn",
                            "logicalName": "modifiedon"
                        },
                        "Created On": {
                            "locale": {
                                "1030": {
                                    "displayName": "Oprettet"
                                },
                                "1033": {
                                    "displayName": "Created On"
                                }
                            },
                            "type": {
                                "type": "DateTime",
                                "required": true
                            },
                            "displayName": "Created On",
                            "schemaName": "CreatedOn",
                            "logicalName": "createdon"
                        },
                        "Owner": {
                            "locale": {
                                "1030": {
                                    "displayName": "Ejer"
                                },
                                "1033": {
                                    "displayName": "Owner"
                                }
                            },
                            "type": {
                                "type": "lookup",
                                "referenceType": "Identity",
                                "required": true,
                                "foreignKey": {
                                    "principalTable": "identity",
                                    "principalColumn": "id",
                                    "principalNameColumn": "name",
                                    "name": "owner"
                                }
                            },
                            "displayName": "Owner",
                            "schemaName": "OwnerId",
                            "logicalName": "ownerid"
                        },
                        "Modified By": {
                            "locale": {
                                "1030": {
                                    "displayName": "Ændret af"
                                },
                                "1033": {
                                    "displayName": "Modified By"
                                }
                            },
                            "type": {
                                "type": "lookup",
                                "referenceType": "Identity",
                                "required": true,
                                "foreignKey": {
                                    "principalTable": "identity",
                                    "principalColumn": "id",
                                    "principalNameColumn": "name",
                                    "name": "modifiedby"
                                }
                            },
                            "displayName": "Modified By",
                            "schemaName": "ModifiedById",
                            "logicalName": "modifiedbyid"
                        },
                        "Created By": {
                            "locale": {
                                "1030": {
                                    "displayName": "Oprettet af"
                                },
                                "1033": {
                                    "displayName": "Created By"
                                }
                            },
                            "type": {
                                "type": "lookup",
                                "referenceType": "Identity",
                                "required": true,
                                "foreignKey": {
                                    "principalTable": "identity",
                                    "principalColumn": "id",
                                    "principalNameColumn": "name",
                                    "name": "createdby"
                                }
                            },
                            "displayName": "Created By",
                            "schemaName": "CreatedById",
                            "logicalName": "createdbyid"
                        },
                        "Row Version": {
                            "type": {
                                "type": "binary"
                            },
                            "isRowVersion": true,
                            "displayName": "Row Version",
                            "schemaName": "RowVersion",
                            "logicalName": "rowversion",
                            "locale": {
                                "1033": {
                                    "displayName": "Row Version"
                                }
                            }
                        }
                    },
                    "displayName": "Document",
                    "schemaName": "Document",
                    "logicalName": "document",
                    "collectionSchemaName": "Documents"
                }

            }
        }
    }, [data.manifest, column.logicalName]);


    //    const _manifestmerger = useRef(_manifest);
    const _manifestmerger = useContext(manifestcontext);

    const setManifest = (manifest: ManifestDefinition, merge = true) => {



        const content = { ...data[column.logicalName.slice(0, -2)] ?? { path: `/${data.id}/manifest.json`, container: "manifests", contenttype: "application/json" } };

        //console.log("Updating manifest", [_manifest, manifest, content.data === btoa(String.fromCharCode.apply(null, Array.from(gzip(JSON.stringify(manifest)))))]);
        console.log("Updating Manifest Before", [content, _manifestmerger.current]);

        _manifestmerger.current = merge ? mergeDeep(_manifestmerger.current, manifest) : manifest;

        content.data = btoa(String.fromCharCode.apply(null, Array.from(gzip(JSON.stringify(_manifestmerger.current)))));

        console.log("Updating Manifest After",
            [data[column.logicalName.slice(0, -2)], content, data[column.logicalName.slice(0, -2)] === content,
            data[column.logicalName.slice(0, -2)]?.data === content.data, _manifestmerger.current]);

        onFormDataChange((props) => { props[isLookup(column.type) ? column.logicalName.slice(0, -2):column.logicalName] = isLookup(column.type) ? content : content.data });
    }

    return [_manifest,
        setManifest,
        (validationExpression: ValidationExpression) => setManifest(addValidation(_manifest, validationExpression))
    ]


}