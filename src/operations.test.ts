import { describe, expect, test } from '@jest/globals';
import { parseExpression } from './operations';

describe('Test parseExpression', () => {
  test('INT op', () => {
    expect(parseExpression('INT(a)', { a: '1' })).toBe(1);
  });

  test('FLOAT op', () => {
    expect(parseExpression('FLOAT(a)', { a: '1.234' })).toBe(1.234);
  });

  test('STRING op', () => {
    expect(parseExpression('STRING(1)', {})).toBe('1');
    expect(parseExpression('STRING(a)', { a: 123 })).toBe('123');
  });

  test('SLUG op', () => {
    expect(parseExpression('SLUG(a)', { a: 'This is a title 123 !@#,./"' })).toBe('this-is-a-title-123-');
  });

  test('CURRENCY op', () => {
    expect(parseExpression('CURRENCY(a)', { a: 1000 })).toBe('1,000');
  });

  test('DATE_ISO op', () => {
    expect(parseExpression('DATE_ISO(a)', { a: '2022-01-01' })).toBe('2022-01-01T00:00:00.000Z');
  });

  test('DATE_UTC op', () => {
    expect(parseExpression('DATE_UTC(a)', { a: '2022-01-01' })).toBe('Sat, 01 Jan 2022 00:00:00 GMT');
  });

  test('ABS op', () => {
    expect(parseExpression('ABS(a)', { a: -1 })).toBe(1);
  });

  test('SQRT op', () => {
    expect(parseExpression('SQRT(a)', { a: 100 })).toBe(10);
  });

  test('SUM op', () => {
    expect(parseExpression('SUM(a)', { a: [1, 2, 3, 4, 5] })).toBe(15);
    expect(parseExpression('SUM(a)', { a: 1 })).toBe(0);
  });

  test('AVERAGE op', () => {
    expect(parseExpression('AVERAGE(a)', { a: [1, 2, 3, 4, 5] })).toBe(3);
    expect(parseExpression('AVERAGE(a)', { a: 1 })).toBe(0);
  });

  test('NULL op', () => {
    expect(parseExpression('NULL(a)', { a: null })).toBe(true);
    expect(parseExpression('NULL(a)', { a: undefined })).toBe(false);
    expect(parseExpression('NULL(a)', { a: 0 })).toBe(false);
    expect(parseExpression('NULL(a)', { a: '' })).toBe(false);
    expect(parseExpression('NULL(a)', { a: {} })).toBe(false);
    expect(parseExpression('NULL(a)', { a: [] })).toBe(false);
  });
});
