import * as fs from 'fs';
import { describe } from 'node:test';
import * as path from 'path';

describe('tsconfig.json', () => {
  const tsconfigPath = path.resolve(__dirname, '../tsconfig.json');
  let tsconfig: any;

  beforeAll(() => {
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
    tsconfig = JSON.parse(tsconfigContent);
  });


  function beforeAll(arg0: () => void) {
    throw new Error('Function not implemented.');
  }
});
