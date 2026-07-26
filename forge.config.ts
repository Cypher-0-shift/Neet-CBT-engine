import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { VitePlugin } from '@electron-forge/plugin-vite';

const config: ForgeConfig = {
  packagerConfig: {
    name: 'NEET CBT Practice',
    executableName: 'neet-cbt-practice',
    asar: {
      unpack: '**/node_modules/better-sqlite3/**/*',
    },
    icon: './app/renderer/assets/icons/icon',
  },

  makers: [
    new MakerSquirrel({
      name: 'neet-cbt-practice',
    }),
    new MakerZIP({}, ['darwin', 'linux']),
  ],

  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'app/main/index.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'app/preload/index.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
  ],
};

export default config;
