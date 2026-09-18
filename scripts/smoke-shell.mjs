import { spawn } from 'node:child_process';
import electronPath from 'electron';
import { createServer } from 'vite';

const vite = await createServer({ server: { port: 5173, strictPort: true } });
await vite.listen();

const electron = spawn(
  electronPath,
  ['.'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      ELECTRON_RENDERER_URL: vite.resolvedUrls.local[0],
      SHELL_SMOKE: '1',
    },
  },
);

electron.on('exit', async (code) => {
  await vite.close();
  process.exit(code ?? 1);
});
