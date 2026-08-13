'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const version = read('VERSION').trim();
const js = read('src/jellyfin-lyric-motion.js');
const css = read('src/jellyfin-lyric-motion.css');
const windowsInstaller = read('scripts/install.ps1');
const posixInstaller = read('scripts/install.sh');
const dockerfile = read('docker/Dockerfile');
const readme = read('README.md');
const installLauncher = read('INSTALL-WINDOWS.cmd');
const uninstallLauncher = read('UNINSTALL-WINDOWS.cmd');
const windowsUninstaller = read('scripts/uninstall.ps1');

assert.strictEqual(version, '3.0.1');
assert(js.includes(`const VERSION = '${version}';`));
assert(css.includes(`Jellyfin LyricMotion v${version}`));
assert(windowsInstaller.includes(`$Version = "${version}"`));
assert(windowsInstaller.includes(`jellyfin-lyric-motion.css?v=${version}`));
assert(windowsInstaller.includes(`jellyfin-lyric-motion.js?v=${version}`));
assert(posixInstaller.includes(`VERSION="${version}"`));
assert(posixInstaller.includes(`jellyfin-lyric-motion.css?v=${version}`));
assert(posixInstaller.includes(`jellyfin-lyric-motion.js?v=${version}`));
assert(dockerfile.includes(`jellyfin-lyric-motion.css?v=${version}`));
assert(dockerfile.includes(`jellyfin-lyric-motion.js?v=${version}`));
assert(js.includes('window.JellyfinLyricMotion = publicApi;'));
assert(js.includes('window.AppleKaraoke = publicApi;'));
assert(!windowsInstaller.includes('?v=2.0.0'));
assert(!posixInstaller.includes('?v=2.0.0'));
assert(installLauncher.includes('-EnsureAdministrator'));
assert(uninstallLauncher.includes('-EnsureAdministrator'));
assert(windowsInstaller.includes('-Verb RunAs'));
assert(windowsUninstaller.includes('-Verb RunAs'));
assert(windowsInstaller.includes('exit $process.ExitCode'));
assert(windowsUninstaller.includes('exit $process.ExitCode'));

for (const screenshot of [
    'classic-bloom-atmosphere.png',
    'overlap-background-vocals.png',
    'script-safe-tv.png'
]) {
    const relative = `docs/screenshots/${screenshot}`;
    assert(readme.includes(relative), `README does not reference ${relative}`);
    assert(fs.statSync(path.join(root, relative)).size > 50_000, `${relative} is unexpectedly small`);
}

console.log('Release contract: 27 assertions passed.');
