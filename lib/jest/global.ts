import path from 'path';
import fs from 'fs';

export default function loadFile(name: string): string {
  const file = path.join(__dirname, '..', '..', 'test', name);
  return fs.readFileSync(file, { encoding: 'utf8' });
}
