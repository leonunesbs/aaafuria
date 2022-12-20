import { Button, Card, Form, Input } from '@/styles/theme/components';
import { colors, fonts } from '@/styles/theme/foundations';
import { extendTheme, ThemeOverride, type ThemeConfig } from '@chakra-ui/react';
import styles from './styles';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

const overrides: ThemeOverride = {
  config,
  fonts,
  styles,
  colors,
  components: {
    Form,
    Button,
    Input,
    Card,
  },
};

const theme = extendTheme(overrides);

export default theme;
