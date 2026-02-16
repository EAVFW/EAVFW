/**
 * Base color constants for Fluent UI theme shims.
 *
 * Includes grey palette, alpha colors, simple color constants,
 * high-contrast colors, and brand colors.
 */

import { BrandVariants } from '@fluentui/react-components';

import { AlphaColors, Greys } from './themeTypes';

export const grey: Record<Greys, string> = {
  '0': '#000000',
  '2': '#050505',
  '4': '#0a0a0a',
  '6': '#0f0f0f',
  '8': '#141414',
  '10': '#1a1a1a',
  '12': '#1f1f1f',
  '14': '#242424',
  '16': '#292929',
  '18': '#2e2e2e',
  '20': '#333333',
  '22': '#383838',
  '24': '#3d3d3d',
  '26': '#424242',
  '28': '#474747',
  '30': '#4d4d4d',
  '32': '#525252',
  '34': '#575757',
  '36': '#5c5c5c',
  '38': '#616161',
  '40': '#666666',
  '42': '#6b6b6b',
  '44': '#707070',
  '46': '#757575',
  '48': '#7a7a7a',
  '50': '#808080',
  '52': '#858585',
  '54': '#8a8a8a',
  '56': '#8f8f8f',
  '58': '#949494',
  '60': '#999999',
  '62': '#9e9e9e',
  '64': '#a3a3a3',
  '66': '#a8a8a8',
  '68': '#adadad',
  '70': '#b3b3b3',
  '72': '#b8b8b8',
  '74': '#bdbdbd',
  '76': '#c2c2c2',
  '78': '#c7c7c7',
  '80': '#cccccc',
  '82': '#d1d1d1',
  '84': '#d6d6d6',
  '86': '#dbdbdb',
  '88': '#e0e0e0',
  '90': '#e6e6e6',
  '92': '#ebebeb',
  '94': '#f0f0f0',
  '96': '#f5f5f5',
  '98': '#fafafa',
  '100': '#ffffff',
};

export const whiteAlpha: Record<AlphaColors, string> = {
  '5': 'rgba(255, 255, 255, 0.05)',
  '10': 'rgba(255, 255, 255, 0.1)',
  '20': 'rgba(255, 255, 255, 0.2)',
  '30': 'rgba(255, 255, 255, 0.3)',
  '40': 'rgba(255, 255, 255, 0.4)',
  '50': 'rgba(255, 255, 255, 0.5)',
  '60': 'rgba(255, 255, 255, 0.6)',
  '70': 'rgba(255, 255, 255, 0.7)',
  '80': 'rgba(255, 255, 255, 0.8)',
  '90': 'rgba(255, 255, 255, 0.9)',
};

export const blackAlpha: Record<AlphaColors, string> = {
  '5': 'rgba(0, 0, 0, 0.05)',
  '10': 'rgba(0, 0, 0, 0.1)',
  '20': 'rgba(0, 0, 0, 0.2)',
  '30': 'rgba(0, 0, 0, 0.3)',
  '40': 'rgba(0, 0, 0, 0.4)',
  '50': 'rgba(0, 0, 0, 0.5)',
  '60': 'rgba(0, 0, 0, 0.6)',
  '70': 'rgba(0, 0, 0, 0.7)',
  '80': 'rgba(0, 0, 0, 0.8)',
  '90': 'rgba(0, 0, 0, 0.9)',
};

export const grey10Alpha: Record<AlphaColors, string> = {
  '5': 'rgba(26, 26, 26, 0.05)',
  '10': 'rgba(26, 26, 26, 0.1)',
  '20': 'rgba(26, 26, 26, 0.2)',
  '30': 'rgba(26, 26, 26, 0.3)',
  '40': 'rgba(26, 26, 26, 0.4)',
  '50': 'rgba(26, 26, 26, 0.5)',
  '60': 'rgba(26, 26, 26, 0.6)',
  '70': 'rgba(26, 26, 26, 0.7)',
  '80': 'rgba(26, 26, 26, 0.8)',
  '90': 'rgba(26, 26, 26, 0.9)',
};

export const grey12Alpha: Record<AlphaColors, string> = {
  '5': 'rgba(31, 31, 31, 0.05)',
  '10': 'rgba(31, 31, 31, 0.1)',
  '20': 'rgba(31, 31, 31, 0.2)',
  '30': 'rgba(31, 31, 31, 0.3)',
  '40': 'rgba(31, 31, 31, 0.4)',
  '50': 'rgba(31, 31, 31, 0.5)',
  '60': 'rgba(31, 31, 31, 0.6)',
  '70': 'rgba(31, 31, 31, 0.7)',
  '80': 'rgba(31, 31, 31, 0.8)',
  '90': 'rgba(31, 31, 31, 0.9)',
};

export const grey14Alpha: Record<AlphaColors, string> = {
  '5': 'rgba(36, 36, 36, 0.05)',
  '10': 'rgba(36, 36, 36, 0.1)',
  '20': 'rgba(36, 36, 36, 0.2)',
  '30': 'rgba(36, 36, 36, 0.3)',
  '40': 'rgba(36, 36, 36, 0.4)',
  '50': 'rgba(36, 36, 36, 0.5)',
  '60': 'rgba(36, 36, 36, 0.6)',
  '70': 'rgba(36, 36, 36, 0.7)',
  '80': 'rgba(36, 36, 36, 0.8)',
  '90': 'rgba(36, 36, 36, 0.9)',
};

export const white = '#ffffff';

export const black = '#000000';

export const hcHyperlink = '#ffff00';

export const hcHighlight = '#1aebff';

export const hcDisabled = '#3ff23f';

export const hcCanvas = '#000000';

export const hcCanvasText = '#ffffff';

export const hcHighlightText = '#000000';

export const hcButtonText = '#000000';

export const hcButtonFace = '#ffffff';

export const brandWeb: BrandVariants = {
  10: `#061724`,
  20: `#082338`,
  30: `#0a2e4a`,
  40: `#0c3b5e`,
  50: `#0e4775`,
  60: `#0f548c`,
  70: `#115ea3`,
  80: `#0f6cbd`,
  90: `#2886de`,
  100: `#479ef5`,
  110: `#62abf5`,
  120: `#77b7f7`,
  130: `#96c6fa`,
  140: `#b4d6fa`,
  150: `#cfe4fa`,
  160: `#ebf3fc`,
};
