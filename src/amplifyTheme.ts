import { createTheme, defaultDarkModeOverride } from '@aws-amplify/ui-react';

export const amplifyTheme = createTheme({
  name: 'dark-custom-theme',
  overrides: [defaultDarkModeOverride],
  tokens: {
    colors: {
      background: {
        primary: { value: 'hsl(220, 17%, 10%)' },
        secondary: { value: 'hsl(220, 17%, 13%)' },
      },
      font: {
        interactive: { value: 'hsl(220, 13%, 91%)' },
      },
      brand: {
        primary: {
          10: { value: 'hsl(220, 13%, 91%)' },
          20: { value: 'hsl(220, 13%, 80%)' },
          40: { value: 'hsl(220, 13%, 70%)' },
          60: { value: 'hsl(220, 13%, 60%)' },
          80: { value: 'hsl(220, 13%, 50%)' },
          90: { value: 'hsl(220, 13%, 40%)' },
          100: { value: 'hsl(220, 13%, 30%)' },
        },
      },
      border: {
        primary: { value: 'hsl(220, 17%, 20%)' },
        secondary: { value: 'hsl(220, 17%, 25%)' },
      },
    },
    components: {
      authenticator: {
        router: {
          boxShadow: { value: 'none' },
          backgroundColor: { value: '{colors.background.secondary}' },
        },
      },
      button: {
        primary: {
          backgroundColor: { value: '{colors.brand.primary.60}' },
          color: { value: '{colors.background.primary}' },
          _hover: {
            backgroundColor: { value: '{colors.brand.primary.80}' },
          },
        },
      },
      fieldcontrol: {
        color: { value: '{colors.font.interactive}' },
        borderColor: { value: '{colors.border.secondary}' },
        _focus: {
          borderColor: { value: '{colors.brand.primary.60}' },
        },
      },
      heading: {
        color: { value: '{colors.font.interactive}' },
      },
      text: {
        color: { value: '{colors.font.interactive}' },
      },
    },
  },
});

