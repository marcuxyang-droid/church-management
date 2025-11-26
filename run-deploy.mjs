import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname);

const isWindows = process.platform === 'win32';
const script = isWindows
    ? resolve(projectRoot, 'deploy.ps1')
    : resolve(projectRoot, 'deploy.sh');

const command = isWindows ? 'powershell.exe' : 'bash';
const args = isWindows
    ? ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script]
    : [script];

const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
});

process.exit(result.status ?? 1);

