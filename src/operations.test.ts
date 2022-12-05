import { describe, expect, test, jest } from '@jest/globals';
import { parseExpression, parseOp, toSlug } from './operations';

jest
  .useFakeTimers()
  .setSystemTime(new Date('2023-01-01'));

describe('Test parseExpression', () => {
  test('Dynamic variables', () => {
    expect(parseExpression('$NOW', {})).toStrictEqual(new Date());
  });

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

  test('DATE op', () => {
    expect(parseExpression('DATE(a)', { a: '2022-01-01' })).toEqual(new Date('2022-01-01'));
    expect(parseExpression('DATE(a)', { a: 1640995200000 })).toEqual(new Date('2022-01-01'));
  });

  test('SLUG op', () => {
    expect(parseExpression('SLUG(a)', { a: 'This is a title 123 !@#,./"' })).toBe('this-is-a-title-123-');
  });

  test('CURRENCY op', () => {
    expect(parseExpression('CURRENCY(a)', { a: 1000 })).toBe('1,000');
  });

  describe('Date ops', () => {
    test('DATE_ISO op', () => {
      expect(parseExpression('DATE_ISO(a)', { a: '2022-01-01' })).toBe('2022-01-01T00:00:00.000Z');
      expect(parseExpression('DATE_ISO($NOW)', {})).toBe('2023-01-01T00:00:00.000Z');
    });

    test('DATE_UTC op', () => {
      expect(parseExpression('DATE_UTC(a)', { a: '2022-01-01' })).toBe('Sat, 01 Jan 2022 00:00:00 GMT');
      expect(parseExpression('DATE_UTC($NOW)', {})).toBe('Sun, 01 Jan 2023 00:00:00 GMT');
    });

    test('YEAR op', () => {
      expect(parseExpression('YEAR($NOW)', {})).toBe(new Date().getFullYear());
    });

    test('MONTH op', () => {
      expect(parseExpression('MONTH($NOW)', {})).toBe(new Date().getMonth());
    });

    test('GET_DATE op', () => {
      expect(parseExpression('GET_DATE($NOW)', {})).toBe(new Date().getDate());
    });

    test('DAY op', () => {
      expect(parseExpression('DAY($NOW)', {})).toBe(new Date().getDay());
    });

    test('HOURS op', () => {
      expect(parseExpression('HOURS($NOW)', {})).toBe(new Date().getHours());
    });

    test('MINUTES op', () => {
      expect(parseExpression('MINUTES($NOW)', {})).toBe(new Date().getMinutes());
    });

    test('SECONDS op', () => {
      expect(parseExpression('SECONDS($NOW)', {})).toBe(new Date().getSeconds());
    });

    test('TIME op', () => {
      expect(parseExpression('TIME($NOW)', {})).toBe(new Date().getTime());
    });
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

  test('NOT_NULL op', () => {
    expect(parseExpression('NOT_NULL(a)', { a: null })).toBe(false);
    expect(parseExpression('NOT_NULL(a)', { a: undefined })).toBe(true);
    expect(parseExpression('NOT_NULL(a)', { a: 0 })).toBe(true);
    expect(parseExpression('NOT_NULL(a)', { a: '' })).toBe(true);
    expect(parseExpression('NOT_NULL(a)', { a: {} })).toBe(true);
    expect(parseExpression('NOT_NULL(a)', { a: [] })).toBe(true);
  });

  test('NOT op', () => {
    expect(parseExpression('NOT(a)', { a: false })).toBe(true);
    expect(parseExpression('NOT(a)', { a: true })).toBe(false);
  });

  test('STR_LEN op', () => {
    expect(parseExpression('STR_LEN(a)', { a: '123' })).toBe(3);
    expect(parseExpression('STR_LEN(a)', { a: 1 })).toBe(1);
  });

  test('LOWER op', () => {
    expect(parseExpression('LOWER(a)', { a: 'ABCDEF' })).toBe('abcdef');
  });

  test('UPPER op', () => {
    expect(parseExpression('UPPER(a)', { a: 'abcdef' })).toBe('ABCDEF');
  });

  test('TRIM op', () => {
    expect(parseExpression('TRIM(a)', { a: '   abc  def   ' })).toBe('abc  def');
  });

  test('ARRAY_LEN op', () => {
    expect(parseExpression('ARRAY_LEN(a)', { a: [1, 2, 3] })).toBe(3);
    expect(parseExpression('ARRAY_LEN(a)', { a: 1 })).toBe(0);
  });

  test('SUM op', () => {
    expect(parseExpression('SUM(a, b)', { a: 1, b: 2 })).toBe(3);
  });

  test('SUBTRACT op', () => {
    expect(parseExpression('SUBTRACT(a, b)', { a: 5, b: 2 })).toBe(3);
    expect(parseExpression('SUBTRACT(DATE(a), DATE(b))', { a: '2022-01-02', b: '2022-01-01' })).toBe(86400000);
  });

  test('MULTIPLY op', () => {
    expect(parseExpression('MULTIPLY(a, b)', { a: 5, b: 2 })).toBe(10);
  });

  test('DIVIDE op', () => {
    expect(parseExpression('DIVIDE(a, b)', { a: 5, b: 2 })).toBe(2.5);
  });

  test('REMAINDER op', () => {
    expect(parseExpression('REMAINDER(a, b)', { a: 5, b: 2 })).toBe(1);
  });

  test('ROUND op', () => {
    expect(parseExpression('ROUND(a, b)', { a: 5, b: 2 })).toBe('5.00');
  });

  test('MAX op', () => {
    expect(parseExpression('MAX(a, b)', { a: 5, b: 2 })).toBe(5);
  });

  test('MIN op', () => {
    expect(parseExpression('MIN(a, b)', { a: 5, b: 2 })).toBe(2);
  });

  test('POWER op', () => {
    expect(parseExpression('POWER(a, b)', { a: 5, b: 2 })).toBe(25);
  });

  test('CONCAT op', () => {
    expect(parseExpression('CONCAT(a, b)', { a: '123', b: '456' })).toBe('123456');
  });

  test('LEFT op', () => {
    expect(parseExpression('LEFT(a, b)', { a: '123456', b: 2 })).toBe('12');
  });

  test('RIGHT op', () => {
    expect(parseExpression('RIGHT(a, b)', { a: '123456', b: 2 })).toBe('56');
  });

  test('EQUAL op', () => {
    expect(parseExpression('EQUAL(a, b)', { a: 1, b: 1 })).toBe(true);
    expect(parseExpression('EQUAL(a, b)', { a: 1, b: '1' })).toBe(false);
  });

  test('NOT_EQUAL op', () => {
    expect(parseExpression('NOT_EQUAL(a, b)', { a: 1, b: 1 })).toBe(false);
    expect(parseExpression('NOT_EQUAL(a, b)', { a: 1, b: '1' })).toBe(true);
  });

  test('GT op', () => {
    expect(parseExpression('GT(a, b)', { a: 1, b: 2 })).toBe(false);
    expect(parseExpression('GT(a, b)', { a: 1, b: 1 })).toBe(false);
    expect(parseExpression('GT(a, b)', { a: 2, b: 1 })).toBe(true);
  });

  test('GTE op', () => {
    expect(parseExpression('GTE(a, b)', { a: 1, b: 2 })).toBe(false);
    expect(parseExpression('GTE(a, b)', { a: 1, b: 1 })).toBe(true);
    expect(parseExpression('GTE(a, b)', { a: 2, b: 1 })).toBe(true);
  });

  test('LT op', () => {
    expect(parseExpression('LT(a, b)', { a: 1, b: 2 })).toBe(true);
    expect(parseExpression('LT(a, b)', { a: 1, b: 1 })).toBe(false);
    expect(parseExpression('LT(a, b)', { a: 2, b: 1 })).toBe(false);
  });

  test('LTE op', () => {
    expect(parseExpression('LTE(a, b)', { a: 1, b: 2 })).toBe(true);
    expect(parseExpression('LTE(a, b)', { a: 1, b: 1 })).toBe(true);
    expect(parseExpression('LTE(a, b)', { a: 2, b: 1 })).toBe(false);
  });

  test('AND op', () => {
    expect(parseExpression('AND(a, b)', { a: true, b: true })).toBe(true);
    expect(parseExpression('AND(a, b)', { a: true, b: false })).toBe(false);
    expect(parseExpression('AND(a, b)', { a: false, b: true })).toBe(false);
    expect(parseExpression('AND(a, b)', { a: false, b: false })).toBe(false);
  });

  test('OR op', () => {
    expect(parseExpression('OR(a, b)', { a: true, b: true })).toBe(true);
    expect(parseExpression('OR(a, b)', { a: true, b: false })).toBe(true);
    expect(parseExpression('OR(a, b)', { a: false, b: true })).toBe(true);
    expect(parseExpression('OR(a, b)', { a: false, b: false })).toBe(false);
  });

  test('ASUM op', () => {
    expect(parseExpression('ASUM(a, b)', { a: [{b: 5}, {b: 10}, {b: 0}, {b: 15}] })).toBe(30);
    expect(parseExpression('ASUM(a, MULTIPLY(b, c))', { a: [{b: 5, c: 1}, {b: 10, c: 2}, {b: 1000, c: 0}, {b: 15, c: 10}] })).toBe(175);
  });
});

describe('Test parseOp', () => {
  test('Simple unary op', () => {
    expect(parseOp('OP_(var)')).toStrictEqual({
      op: 'OP_',
      a: 'var',
      b: null,
    });
  });

  test('Simple binary op', () => {
    expect(parseOp('OP_(var1,var2)')).toStrictEqual({
      op: 'OP_',
      a: 'var1',
      b: 'var2',
    });
  });

  test('Literal number', () => {
    expect(parseOp('1')).toStrictEqual(null);
  });

  test('Field value', () => {
    expect(parseOp('a')).toStrictEqual(null);
  });

  test('Complex op 1', () => {
    expect(parseOp('OP_(OP_(var1))')).toStrictEqual({
      op: 'OP_',
      a: 'OP_(var1)',
      b: null,
    });
  });

  test('Complex op 2', () => {
    expect(parseOp('OP_(OP_(var1),var2)')).toStrictEqual({
      op: 'OP_',
      a: 'OP_(var1)',
      b: 'var2',
    });
  });

  test('Complex op 3', () => {
    expect(parseOp('OP_(OP_(var1),OP_(var2))')).toStrictEqual({
      op: 'OP_',
      a: 'OP_(var1)',
      b: 'OP_(var2)',
    });
  });

  test('Complex op 4', () => {
    expect(parseOp('OP_(OP_(OP_(var1), var2),OP_(var3))')).toStrictEqual({
      op: 'OP_',
      a: 'OP_(OP_(var1), var2)',
      b: 'OP_(var3)',
    });
  });

  test('Complex op 5', () => {
    expect(parseOp('OP_(OP_(OP_(var1), var2),OP_(var3, OP_(var4, var5)))')).toStrictEqual({
      op: 'OP_',
      a: 'OP_(OP_(var1), var2)',
      b: 'OP_(var3, OP_(var4, var5))',
    });
  });

  test('Complex op 5', () => {
    expect(parseOp('OP_(OP_(OP_(var1, OP_(var2, OP_(var3, var4))), var5))')).toStrictEqual({
      op: 'OP_',
      a: 'OP_(OP_(var1, OP_(var2, OP_(var3, var4))), var5)',
      b: null,
    });
  });
});

describe('Test toSlug', () => {
  test('English text', () => {
    expect(toSlug('We’ll always be with you. No one’s ever really gone. A thousand generations live in you now.'))
      .toBe('well-always-be-with-you-no-ones-ever-really-gone-a-thousand-generations-live-in-you-now');

    expect(toSlug('123 ABC !@# a12 []=-,./<>? DEF')).toBe('123-abc-a12-def');
  });

  test('Multi-line', () => {
    expect(toSlug(`
We’ll always be with you. 
No one’s ever really gone. 
A thousand generations live in you now.`))
      .toBe('well-always-be-with-you-no-ones-ever-really-gone-a-thousand-generations-live-in-you-now');
  });

  test('Non-English text', () => {
    expect(toSlug(`
  Trăm năm trong cõi người ta,
  Chữ tài chữ mệnh khéo là ghét nhau.
  Trải qua một cuộc bể dâu,
  Những điều trông thấy mà đau đớn lòng.`))
      .toBe('tram-nam-trong-coi-nguoi-ta-chu-tai-chu-menh-kheo-la-ghet-nhau-trai-qua-mot-cuoc-be-dau-nhung-dieu-trong-thay-ma-dau-don-long')
  });

  test('Not a string', () => {
    expect(toSlug(1)).toBe('');
    expect(toSlug({})).toBe('');
    expect(toSlug([])).toBe('');
    expect(toSlug(new Date())).toBe('');
    expect(toSlug(new RegExp('123'))).toBe('');
  });
});
