import test from 'node:test';
import assert from 'node:assert';

import { double, triple } from './main.js';

test('double function', (t) => {
  t.todo('Double 10. 10 * 2 = 20');
  assert.strictEqual(double(10), 20);
});

test('triple function', (t) => {
  t.todo('triple 10. 10 * 3 = 30');
  assert.strictEqual(triple(10), 30);
});

