import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const input = 'sample-input.json';
const output = 'smoke-resume';
const mdPath = `output/${output}.md`;
const pdfPath = `output/${output}.pdf`;

const run = (args: string[]) =>
  new Promise<void>((resolve, reject) => {
    const proc = spawn('bun', ['index.ts', ...args], { stdio: 'inherit' });
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`bun exited ${code}`))));
  });

(async () => {
  await run(['--input', input, '--output', output, '--format', 'both', '--verbose']);
  console.log('Markdown exists:', existsSync(mdPath));
  console.log('PDF exists:', existsSync(pdfPath));
})();
