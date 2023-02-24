import test from 'node:test';
import assert from 'node:assert';

import { dtsSum, dtsRandom, DtsClass } from './useDts.js';

test('useDts module test', async (t) => {
  t.todo('dtsSum two numbers 10 + 10 = 20');
  assert.strictEqual(dtsSum(10, 10), 20);

  t.todo('dtsRandom function');
  const got = dtsRandom();
  assert(got === 'example' || got === 'type');

  t.todo('DtsClass class test');
  const instnace = new DtsClass();
  assert(instnace);
  const nothing = await instnace.write(Buffer.from('string'));
  assert.strictEqual(nothing, undefined);
});
