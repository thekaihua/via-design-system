// Where the private design file lives. Set VIA_PEN_FILE, or put its path (relative to this repo) on one
// line in .design-file, which git ignores. Without either, token generation is unavailable and the
// sync checks are skipped; the generated tokens in src/tokens are committed.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export function penFilePath(root) {
  const configured = process.env.VIA_PEN_FILE ?? (existsSync(path.join(root, '.design-file')) ? readFileSync(path.join(root, '.design-file'), 'utf8').trim() : '');
  return configured ? path.resolve(root, configured) : null;
}
