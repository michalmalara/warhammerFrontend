import {describe, expect, it} from 'vitest';

import {toCamelCaseDeep, toSnakeCaseDeep} from './case-converter';

describe('case-converter', () => {
  it('converts camelCase keys to snake_case deeply', () => {
    const input = {
      someKey: 1,
      nestedValue: {
        innerKey: 'x',
        arr: [{deepKey: true}],
      },
      already_snake: 'ok',
    };

    expect(toSnakeCaseDeep(input)).toEqual({
      some_key: 1,
      nested_value: {
        inner_key: 'x',
        arr: [{deep_key: true}],
      },
      already_snake: 'ok',
    });
  });

  it('converts snake_case keys to camelCase deeply', () => {
    const input = {
      some_key: 1,
      nested_value: {
        inner_key: 'x',
        arr: [{deep_key: true}],
      },
    };

    expect(toCamelCaseDeep(input)).toEqual({
      someKey: 1,
      nestedValue: {
        innerKey: 'x',
        arr: [{deepKey: true}],
      },
    });
  });
});

