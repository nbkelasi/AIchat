import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const config: ForgeConfig = {
  packagerConfig: {
    name: 'AIchat',
    // executableName 必须与 package.json 中的 productName 完全一致
    // 否则 MakerDeb 会找不到对应的二进制文件
    executableName: 'AIChat',
    icon: './assets/icon',
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      // 应用信息
      name: 'AIchat',
      authors: 'Zhang Xin',
      description: 'A chat application',
      // 快捷方式设置
      setupExe: 'AIchat-Setup.exe',  // 安装程序名称
    }),
    new MakerRpm({}), 
    new MakerDeb({}),
    // @ts-expect-error - https://github.com/electron/forge/issues/3712
    new MakerDMG({
      icon: './assets/icon.icns',
      format: 'ULFO',
    }),
    new MakerZIP({}, ['darwin']), 
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'nbkelasi',
          name: 'AIchat'
        },
        prerelease: false,
        draft: true,
        authToken: process.env.GITHUB_TOKEN
      }
    }
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      // 禁用 RunAsNode：防止攻击者通过环境变量将应用作为 Node.js 解释器运行
      [FuseV1Options.RunAsNode]: false,
      // 启用 Cookie 加密：对本地 Cookie 数据进行加密存储，防止敏感信息泄露
      [FuseV1Options.EnableCookieEncryption]: true,
      // 禁用 Node.js 选项环境变量：防止通过 NODE_OPTIONS 环境变量注入恶意参数
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      // 禁用 Node.js CLI inspect 参数：防止通过调试参数远程附加调试器
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      // 启用 ASAR 完整性校验：防止 ASAR 压缩包被篡改
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      // 仅加载 ASAR 压缩包：防止磁盘上的代码被非法替换
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
