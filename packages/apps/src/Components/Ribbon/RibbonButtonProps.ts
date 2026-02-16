import { IIconProps } from '@fluentui/react';

export type RibbonButtonProps = {
  key: string;
  visible?: boolean;
  workflow?: Record<string, unknown>;
  text?: string;
  title?: string;
  iconProps?: IIconProps;
};
