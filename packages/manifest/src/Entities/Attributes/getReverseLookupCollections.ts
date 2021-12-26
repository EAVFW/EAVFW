import { ManifestDefinition } from "../../ManifestDefinition";
import { isAttributeLookup } from "./isAttributeLookup";

export function getReverseLookupCollections(manifest: ManifestDefinition, entityKey: string) {
    let relatedEntities = [];
    for (const [referenceEntityKey, entity] of Object.entries(manifest.entities)) {
        for (const attribute of Object.values(entity.attributes)) {
            if (
                isAttributeLookup(attribute) &&
                attribute.type.referenceType === entityKey
            ) {
                relatedEntities.push(referenceEntityKey);
            }
        }
    }
    return relatedEntities;
}
