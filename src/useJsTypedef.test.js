import test from 'node:test';
import assert from 'node:assert';

import { jsDocDouble, jsDocRandom, JSDocClass } from './useJsTypedef.js';

test('useJsTypedef module test', async (t) => {
  t.todo('jsDocDouble function 10 * 2 = 20');
  assert.strictEqual(jsDocDouble(10), 20);

  t.todo('jsDocRandom function');
  const got = jsDocRandom();
  assert(got === 'example' || got === 'type');

  t.todo('JSDocClass class');
  const instnace = new JSDocClass();
  assert(instnace);
  const nothing = await instnace.write(Buffer.from('string'));
  assert.strictEqual(nothing, undefined);
});
