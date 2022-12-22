import { Button, Card, Input } from '@/styles/theme/components';
import { colors, fonts } from '@/styles/theme/foundations';
import { extendTheme, ThemeOverride, type ThemeConfig } from '@chakra-ui/react';
import styles from './styles';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const overrides: ThemeOverride = {
  config,
  fonts,
  styles,
  colors,
  components: {
    Button,
    Input,
    Card,
  },
};

const theme = extendTheme(overrides);

export default theme;
