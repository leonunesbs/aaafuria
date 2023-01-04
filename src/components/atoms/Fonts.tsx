import { Global } from '@emotion/react';
import { ReactNode } from 'react';

interface FontsProps {
  children?: ReactNode;
}

export function Fonts({}: FontsProps) {
  return (
    <Global
      styles={`
      /* heading */
      /* latin */
      @font-face {
        font-family: 'AACHENN';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: local('AACHENN'),
        url('/fonts/woff2/AACHENN.woff2') format('woff2'), /* will be preloaded */
        url('/fonts/woff/AACHENN.woff') format('woff'),
        url('/fonts/AACHENN.TTF') format('truetype');
        unicode-range: U+000-5FF;
      }
      /* body */
      /* latin */
      @font-face {
        font-family: 'Lato';
        font-style: light;
        font-weight: 300;
        font-display: swap;
        src: local('Lato Font'),
        url('/fonts/woff2/Lato-Light.woff2') format('woff2'), /* will be preloaded */
        url('/fonts/woff/Lato-Light.woff') format('woff'),
        url('/fonts/Lato-Light.ttf') format('truetype');
        unicode-range: U+000-5FF;
      }
      @font-face {
        font-family: 'Lato';
        font-style: regular;
        font-weight: 400;
        font-display: swap;
        src: local('Lato Font'),
        url('/fonts/woff2/Lato-Regular.woff2') format('woff2'), /* will be preloaded */
        url('/fonts/woff/Lato-Regular.woff') format('woff'),
        url('/fonts/Lato-Regular.ttf') format('truetype');
        unicode-range: U+000-5FF;
      }
      @font-face {
        font-family: 'Lato';
        font-style: bold;
        font-weight: 700;
        font-display: swap;
        src: local('Lato Font'),
        url('/fonts/woff2/Lato-Bold.woff2') format('woff2'), /* will be preloaded */
        url('/fonts/woff/Lato-Bold.woff') format('woff'),
        url('/fonts/Lato-Bold.ttf') format('truetype');
        unicode-range: U+000-5FF;
      }
      @font-face {
        font-family: 'Lato';
        font-style: extra-bold;
        font-weight: 900;
        font-display: swap;
        src: local('Lato Font'),
        url('/fonts/woff2/Lato-Black.woff2') format('woff2'), /* will be preloaded */
        url('/fonts/woff/Lato-Black.woff') format('woff'),
        url('/fonts/Lato-Black.ttf') format('truetype');
        unicode-range: U+000-5FF;
      }
      `}
    />
  );
}
