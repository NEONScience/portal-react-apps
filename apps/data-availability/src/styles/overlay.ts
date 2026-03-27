import { Theme as MuiTheme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import { StylesHook } from '../types/styles';

// eslint-disable-next-line import/prefer-default-export
export const useStyles: StylesHook = makeStyles((muiTheme: MuiTheme) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  createStyles({
    section: {
      marginBottom: muiTheme.spacing(4),
    },
    skeleton: {
      marginBottom: '16px',
    },
    overlay: {
      animation: '$opacity-overlay 2s infinite ease-in-out',
      WebkitAnimation: '$opacity-overlay 2s infinite ease-in-out',
      cursor: 'pointer !important',
      pointerEvents: 'none',
    },
    '@keyframes blur-overlay': {
      '0%': {
        filter: 'blur(0.1rem)',
        '-webkit-filter': 'blur(0.1rem)',
      },
      '50%': {
        filter: 'blur(0.2rem)',
        '-webkit-filter': 'blur(0.2rem)',
      },
      '100%': {
        filter: 'blur(0.1rem)',
        '-webkit-filter': 'blur(0.1rem)',
      },
    },
    '@keyframes opacity-overlay': {
      '0%': {
        opacity: 0.7,
      },
      '50%': {
        opacity: 0.4,
      },
      '100%': {
        opacity: 0.9,
      },
    },
  })) as StylesHook;
