import { AttributeDefinition, ChoicesType } from "@eavfw/manifest";
import { FieldProps } from "@rjsf/utils";

export type ChoicesControlProps = {
    required: boolean;
    disabled: boolean;
    readonly: boolean;
    column: AttributeDefinition,
} & FieldProps;