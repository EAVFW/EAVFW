import { AttributeDefinition, LookupAttributeDefinition, ManifestDefinition, FormColumnDefinition, ViewReference, EntityDefinition, isAttributeLookup, getNavigationProperty, TypeFormDefinition, isPolyLookup } from "@eavfw/manifest";
import { FormsConfig } from "./FormsConfig";
import { generateAppContext } from "./generateAppContext";
import { ModelDrivenAppModel } from "./Model/ModelDrivenAppModel";
import { RecordUrlProps } from "./Model/RecordUrlProps";
import cloneDeep from "clone-deep";
import { isAttributeLookupEntry } from "./Components/ColumnFilter/ColumnFilterContext";


export class ModelDrivenApp {
    _data!: ModelDrivenAppModel;
    _isInitialized = false;

    // prettier-ignore
    get sitemap() {
        return this._data.sitemap;
    }

    // prettier-ignore
    get locale() {
        return "1030";
    }

    // prettier-ignore
    get canSave() {
        return false;
    }

    //// prettier-ignore
    //get context() {
    //    return { appName: this.currentAppName, areaName: this.currentAreaName };
    //}

    constructor(manifest?: ManifestDefinition) {
        if (manifest) {
            this._data = generateAppContext(manifest);
        }
    }

    getConfig(key: string) {
        return this._data.config?.[key];
    }

    /**
     * Looks for a localization in the manifest by the given key and returns the
     * desired word, in the desired locale, with the desired pluralization.
     * (_IF_ it exists in the manifest, otherwise it returns undefined)
     * @param key The key in the manifest which contains the desired localization value
     * @param plural Whether or not to return the plural version of the word, default: `false`
     * @param locale Which locale to use, default: `this.locale` (`"1030"`)
     * @returns The desired word translated into the desired locale, _IF_ that locale exists in the manifest
     */
    getLocalization(key: string, plural = false, locale = this.locale) {
        const localization = this._data.localization?.[key];
        const _locale = localization?.locale?.[locale] ?? localization;
        return plural ? _locale?.plural : _locale?.value;
    }

    /**
     * Returns localized error messages defined in the manifest
     * @param code Error code 
     * @param locale Localization
     */
    getLocaleErrorMessage(code: string, locale = this.locale): string | undefined {
        return this._data.errorMessages?.[locale]?.[code];
    }

    getArea(area: string) {
        return this.sitemap.areas[area];
    }

    getEntity(entityName: string) {
        if (!entityName)
            throw new Error("entityName not provided");
        return this._data.entities[entityName.toLowerCase().replace(/\s/g, "")];
    }

    getDashboard(dashboardName: string) {
        return this._data.dashboards?.[dashboardName];
    }

    getAttributes(entityName: string) {
        var targetEntity = this.getEntity(entityName);
        return { ...((targetEntity.TPT && this.getEntity(targetEntity.TPT).attributes) ?? {}), ...targetEntity.attributes }
    }

    getPrimaryField(entityName: string) {
        const attributes = this.getAttributes(entityName);

        return Object.values(attributes).filter(a => a.isPrimaryField)[0]?.logicalName;
    }

    getDefaultFormName(entityName: string) {
        return Object.keys(this.getEntity(entityName).forms ?? {})[0];
    }

    getAttributeType(attribute: AttributeDefinition) {
        return typeof attribute.type === "string" ? attribute.type : attribute.type.type;
    }

    getAttribute(attributes: {
        [key: string]: AttributeDefinition
    }, column: string) {

        if (column.indexOf('/') !== -1) {
            var parts = column.split('/');
            var navAttributes = attributes;
            var nav = column;
            while (parts.length) {
                nav = parts.shift()!;
                var lookup = navAttributes[nav];

                if (!parts.length)
                    return lookup;

                if (lookup && isAttributeLookup(lookup)) {

                    var entity = this.getEntityFromKey(lookup.type.referenceType);
                    navAttributes = entity.attributes;
                } else {
                    return navAttributes[nav];
                }

            }
            return navAttributes[nav];
        }

        return attributes[column];
    }



    getApps() {

        return Object.entries(this._data.apps);// Object.keys(this._data.apps);
    }
    getApp(appKey: string) {

        return this._data.apps[appKey];
    }

    //isAttributeLookup(attribute: AttributeDefinition): attribute is LookupAttributeDefinition {
    //    return isAttributeLookup(attribute); // this.getAttributeType(attribute) === "lookup";
    //}

    isMatchingForm(form: FormColumnDefinition | undefined, tabName: string, columnName: string, sectionName: string) {
        if (typeof form === "undefined") return false;
        return form.tab === tabName && form.column === columnName && form.section === sectionName;
    }

    getFormsConfig(): FormsConfig | undefined {
        return this._data.config?.pages?.forms;
    }

    getRelated(entityName: string) {
        let relatedEntities = [];
        for (const entity of Object.values(this._data.entities)) {
            for (const attribute of Object.values(entity.attributes)) {
                if (
                    isAttributeLookup(attribute) &&
                    this._data.entityMap[attribute.type.referenceType] === entityName
                ) {
                    relatedEntities.push(entity.collectionSchemaName.toLowerCase());
                }
            }
        }
        return relatedEntities;
    }
    getEntityFromKey(key: string) {
        return this.getEntity(this._data.entityMap[key]);
    }
    getEntityKey(logicalName: string) {
        return Object.entries(this._data.entityMap).filter(([entityKey, entityLogicalName]) => entityLogicalName === logicalName)[0][0]
    }
    getEntityFromCollectionSchemaName(key: string) {
        return this.getEntity(this._data.entityCollectionSchemaNameMap[key]);
    }
    getExpandQueryParam(entityDefinition: EntityDefinition, expandall = false, includeHierachi = false) {



        let attributes = this.getAttributes(entityDefinition.logicalName);

        if (expandall) {
            let expand = Object.values(includeHierachi ? attributes : entityDefinition.attributes)
                .filter(isAttributeLookup)
                .map((a) => getNavigationProperty(a))
                .join(",");

            return expand
        }

        let expand = Object.values(attributes).filter(isAttributeLookup).map((a) => `${getNavigationProperty(a)}($select=${Object.values(this.getAttributes(this.getEntityFromKey(a.type.referenceType).logicalName)).filter(c => c.isPrimaryField)[0].logicalName})`).join(',');
        return expand;
    }

    getReferences(entityName: string, formName: string, tabName: string, columnName: string, sectionName: string) {
        console.group("ModelDrivenApp::getReferences");

        //  console.log("arguments:\n", arguments);
        const references: Array<ViewReference> = [];
        try {
            for (const entity of Object.values(this._data.entities)) {
                console.groupCollapsed("entity.collectionSchemaName:\n", entity.collectionSchemaName);
                try {
                    for (const attribute of Object.values(entity.attributes).filter(isAttributeLookup)) {


                        const referenceTypes = attribute.type.referenceTypes ?? [attribute.type.referenceType]
                        const tpt = this._data.entities[entityName].TPT;
                        //   console.log("attribute.type:\n", [attribute.type, tpt, referenceTypes, entityName,
                        //    referenceTypes.map(referenceType => this._data.entityMap[referenceType]),
                        //    referenceTypes.map(referenceType => this._data.entityMap[referenceType]).some(n => n === entityName || (tpt && this._data.entityMap[tpt] === n))]);
                        if (
                            referenceTypes.map(referenceType => this._data.entityMap[referenceType]).some(n => n === entityName || (tpt && this._data.entityMap[tpt] === n)) &&
                            //(this._data.entityMap[attribute.type.referenceType] === entityName || this._data.entities[entityName].TPT === attribute.type.referenceType) &&
                            attribute.type.forms
                        ) {
                            //   console.log("attribute.type:\n", attribute.type);
                            //    console.log("attribute.type.forms:\n", attribute.type.forms);

                            //let forms = Object.values(attribute.type.forms).filter(form => this.isMatchingForm(form, formName, tabName, columnName, sectionName));
                            for (const formKey of Object.keys(attribute.type.forms)) {
                                const form = attribute.type.forms[formKey] as TypeFormDefinition;
                                if (form.type === "Main") {
                                    if ((formKey === formName || formName === form.name) && this.isMatchingForm(form, tabName, columnName, sectionName)) {

                                        const viewName = form.view ?? Object.keys(entity?.views ?? {})[0];

                                        const logicalname = attribute.type.inline ? Object.entries(entity.attributes)
                                            .filter(isAttributeLookupEntry)
                                            .filter(x => x[1].type.referenceType === this.getEntityKey(entityName))[0][1].logicalName : attribute.logicalName;

                                        references.push({
                                            viewName: viewName,
                                            ribbon: cloneDeep(form.ribbon ?? entity?.views?.[viewName]?.ribbon ?? {}),
                                            view: entity?.views?.[viewName],
                                            entityName: entity.logicalName,
                                            attribute: logicalname,
                                            attributeType: attribute.type?.type,
                                            inlinePolyLookup: attribute.type?.inline,
                                            polylookup: attribute.type?.split ? "split" : attribute.type?.inline ?  "inline": undefined,
                                            entity: entity,
                                            filter: form.filter,
                                            key: entity.logicalName + attribute.logicalName
                                        });
                                    } else {
                                        console.group("Form found but did not match arguments");
                                        const _formKey = (form.name ?? formKey) === formName;
                                        //console.log(`FormKey: ${_formKey}, ${form.name ?? formKey}, ${formName}`);
                                        //console.log(`Tab: ${form.tab === tabName}, ${form.tab} ${tabName}`);
                                        //console.log(`Column: ${form.column === columnName},  ${form.column} ${columnName}`);
                                        //console.log(`Section: ${form.section === sectionName},  ${form.section} ${sectionName}`);

                                        //  console.log("form:\n", form);
                                        console.groupEnd();
                                    }
                                }
                            }
                        }
                    }
                } finally {
                    console.groupEnd();
                }
            }

            console.log("Found References:\n", references);
        } finally {
            console.groupEnd();
        }
        return references;
    }
    getWizardsTriggeredByNew(appname: string, area: string, entityname: string) {
        let wizards = Object.entries(this._data.entities[entityname].wizards ?? {})
            .filter(([key, wizard]) => Object.values(wizard.triggers ?? {}).some(x => x.ribbon && x.ribbon == "NEW"));

        return wizards;
    }
    newEntityUrl(appname: string, area: string, entityname: string, formName?: string, query?: any) {

        console.group("ModelDrivenApp::newEntityUrl");
        console.log("this", this);
        console.log("arguments", arguments);

        if (!entityname)
            throw new Error("entityName not given");

        const q = Object.keys(query ?? {})
            .map((k) => `${k}=${query[k]}`)
            .join("&");
        const _formName = formName ?? this.getDefaultFormName(entityname);

        console.groupEnd();
        return `/apps/${appname}/areas/${area}/entities/${entityname}/forms/${_formName}${q ? `?${q}` : ""}`;
    }

    recordUrl(props: RecordUrlProps) {
        try {
            const formPath = Object.keys(this.getEntity(props.entityName).forms ?? {})[0];
            return `/apps/${props.appName}/areas/${props.areaName}/entities/${props.entityName}/records/${props.recordId}/forms/${formPath}`;
        } catch (err) {
            const [_props, _context] = [JSON.stringify(props), JSON.stringify(props)];
            console.warn(`Failed to generate url for'${_props}' with context '${_context}'`);
            throw err;
        }
    }
}