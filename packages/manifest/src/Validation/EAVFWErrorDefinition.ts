import { EAVFWError } from "./EAVFWError";
import { EAVFWErrorDefinitionMap } from "./EAVFWErrorDefinitionMap";

export type EAVFWErrorDefinition = EAVFWError | EAVFWErrorDefinitionMap | Array<EAVFWError | EAVFWErrorDefinitionMap>;

