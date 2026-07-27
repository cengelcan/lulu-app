import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

type AppConfig = {
  expo?: {
    orientation?: string;
    ios?: {
      requireFullScreen?: boolean;
      supportsTablet?: boolean;
    };
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
