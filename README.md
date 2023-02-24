# library-template

Oldbros template to start developing a library (npm package)

High standarts for high-end quality javascript libraries development

Docs, tests, coverage 90%, js powered with ts, types, lint and examples

NodeJS 16+

## Description

Up to date template for writing libraries. ES Modules.

Utilize typescript as JS extension - code typesafe, more readable and no way to use Questionable ts-specific features. Best from two worlds!
  - See examples in `src` folder.

Documentation from code using `typedoc`

IDE Autocomplition

Testing compatible with `node:test` using `tap` and `c8` for coverage. Coverage 90% required!!!

No **prettier**
  - There are conflicts between eslint and prettier. library **eslint-plugin-prettier** just disables eslint rules if any conflicts with prettier. We don't like that. No rules need to be disabled. Eslint can format for most cases.

Unit tests near by style. for each `.js` file there is `.test.js` file.
For integration testing use `test` folder.

## Usage

1. Create your repository from this template repository

2. Fill `package.json`:
  - [ ] **name**
  - [ ] **description**
  - [ ] **author**
  - [ ] **main** - use the same name as library
  - [ ] **contributors**

## Scripts

1. `npm run fmt` - format with eslint
2. `npm run check` - runs typescript compiler to check project, no types emitted
3. `npm run lint` - eslint checks
4. `npm run test` - coverage with c8 and test
5. `npm run types` - compile d.ts files from javascript code using tsc
6. `npm run docs` - generate docs with typedoc
7. `npm run final` - run all scripts in sequence 1, 2, 3, 4, 5, 6 -> fmt, check, lint, test, types, docs

## Dev dependencies

1. **typescript**, **@oldbros/tsconfig** - tsconfiguration for checking js files with ts-compiler

2. **c8** - coverage reports, prints coverage to STDOUT with `npm t`

3. **eslint**, **eslint-config-oldbros** - eslint and configuration

4. **tap** - testing library, compatible with upcoming `node:test`

5. **typedoc** - Generates docs from ts files using `tsconfig.json`

## Typescript usage

Must read [**TypeScript JSDoc**](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)

1. It is possible to write types in `d.ts` files and use them in your JS code via **@typedef**
  - See `src/dtsTypes.d.ts` and `src/useDts.js`

2. It is possible to use `.js` files to write types convention - name file `.types.js`
  - See `src/.types.js` and `src/useJsTypedef.js`

3. Do not use TS Specific feature: Enums, Namespaces, Decorators, private keyword (there are native js private fields)

4. Don't afraid to use any for very generic types. E.g. many functional techniques and patterns can not be nicely covered with TypeScript without some crazy workarounds based on classes. In case of `object` or `any` ALWAYS specify concrete type after using such generic abstractions.
Example:
```js
/** @type {(fn: object, ...args: any[]) => object} */
const partialApplication = (fn, ...args) =>
  (...nextArgs) => fn(...args, ...nextArgs);

/** @type {(a: number, b: number, c: number) => number} */
const sumThreeNums = (a, b, c) => a + b + c;

/** @type {(b: number, c: number) => number} */
const sumTwoNumsPlusTen = partialApplication(sumThreeNums, 10);

sumTwoNumsPlusTen(10, 10);

```
