import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

type AppConfig = {
  expo?: {
    orientation?: string;
    userInterfaceStyle?: string;
    ios?: {
      requireFullScreen?: boolean;
      supportsTablet?: boolean;
    };
    plugins?: Array<
      | string
      | [
          string,
          {
            image?: string;
            backgroundColor?: string;
            dark?: { image?: string; backgroundColor?: string };
          },
        ]
    >;
  };
};

const appConfig = JSON.parse(
  readFileSync(new URL('../app.json', import.meta.url), 'utf8')
) as AppConfig;

test('keeps phones portrait while allowing iPad multitasking orientations', () => {
  assert.equal(appConfig.expo?.orientation, 'portrait');
  assert.equal(appConfig.expo?.ios?.supportsTablet, true);
  assert.equal(appConfig.expo?.ios?.requireFullScreen, false);
});

test('uses distinct high-contrast splash assets for system light and dark modes', () => {
  const splashPlugin = appConfig.expo?.plugins?.find(
    (plugin): plugin is Exclude<typeof plugin, string> =>
      Array.isArray(plugin) && plugin[0] === 'expo-splash-screen'
  );

  assert.equal(appConfig.expo?.userInterfaceStyle, 'automatic');
  assert.equal(splashPlugin?.[1].image, './assets/images/lulu-logo-splash-light-v2.png');
  assert.equal(splashPlugin?.[1].backgroundColor, '#F7F5FC');
  assert.equal(splashPlugin?.[1].dark?.image, './assets/images/lulu-logo.png');
  assert.equal(splashPlugin?.[1].dark?.backgroundColor, '#101010');
});
