import { keyframes } from 'tss-react';

import { makeStyles } from '@neonscience/portal-core-components/components/Theme/makeStyles';
import { NeonTheme } from '@neonscience/portal-core-components/components/Theme/types';

// const blurOverlay = keyframes({
//   '0%, 100%': {
//     filter: 'blur(0.1rem)',
//   },
//   '50%': {
//     filter: 'blur(0.2rem)',
//   },
// });

const opacityOverlay = keyframes({
  '0%': {
    opacity: 0.7,
  },
  '50%': {
    opacity: 0.4,
  },
  '100%': {
    opacity: 0.9,
  },
});

// eslint-disable-next-line import/prefer-default-export
export const useStyles = makeStyles()((muiTheme: NeonTheme) => ({
  section: {
    marginBottom: muiTheme.spacing(4),
  },
  skeleton: {
    marginBottom: '16px',
  },
  overlay: {
    animation: `${opacityOverlay} 2s infinite ease-in-out`,
    WebkitAnimation: `${opacityOverlay} 2s infinite ease-in-out`,
    cursor: 'pointer !important',
    pointerEvents: 'none',
  },
}));
