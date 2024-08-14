import {
  createAppleSplashScreens,
  defineConfig,
  minimal2023Preset as preset,
} from '@vite-pwa/assets-generator/config';

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...preset,
    transparent: {
      ...preset.transparent,
      padding: 0,
    },
    maskable: {
      ...preset.maskable,
      padding: 0,
    },
    apple: {
      ...preset.apple,
      padding: 0,
    },
    appleSplashScreens: createAppleSplashScreens({
      padding: 0.75,
    }),
  },
  images: ['public/favicon.svg'],
});
