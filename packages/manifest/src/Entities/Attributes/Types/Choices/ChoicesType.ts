/**
 * Attribute type for multi-select choice (flags) attributes. Unlike
 * {@link ChoiceType}, a choices attribute allows selecting multiple options
 * and is backed by a separate intersection entity.
 */
export type ChoicesType = {
  type: 'choices';
  name: string;
  pluralName: string;
  logicalName: string;
  options?: {
    [key: string]: number;
  };
};
