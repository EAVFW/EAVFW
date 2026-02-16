/**
 * These colors have been copied here from react-theme because they are not exported from that package.
 * They are necessary to build the theme shims.
 *
 * This barrel file re-exports all public symbols from the split sub-modules.
 */

export type {
  ColorVariants,
  GlobalSharedColors,
  TextAlignment,
  TextAlignments,
  Greys,
  AlphaColors,
} from './themeTypes';

export {
  grey,
  whiteAlpha,
  blackAlpha,
  grey10Alpha,
  grey12Alpha,
  grey14Alpha,
  white,
  black,
  hcHyperlink,
  hcHighlight,
  hcDisabled,
  hcCanvas,
  hcCanvasText,
  hcHighlightText,
  hcButtonText,
  hcButtonFace,
  brandWeb,
} from './themeBaseColors';

export { sharedColors } from './sharedColors';
