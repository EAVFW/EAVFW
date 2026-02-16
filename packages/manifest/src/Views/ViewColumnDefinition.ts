/** Per-attribute configuration within a view (list/grid). Controls visibility, display name, and card rendering hints. */
export type ViewColumnDefinition = {
  roles?: {
    allowed?: string[];
  };
  displayName?: string;
  useAsCardTitle?: boolean;
  useAsCardSubtitle?: boolean;
  visible?: boolean;
  [key: string]: unknown;
};
