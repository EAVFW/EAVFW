import { AttributeDefinition, ChoicesType } from "@eavfw/manifest";
import { FieldProps } from "@rjsf/core";

export type ChoicesControlProps = {
    required: boolean;
    disabled: boolean;
    readonly: boolean;
    column: AttributeDefinition,
} & FieldProps;