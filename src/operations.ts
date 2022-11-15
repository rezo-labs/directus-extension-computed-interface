import { findValueByPath } from './utils';

export function parseExpression(exp: string, values: Record<string, any>): any {
	if (values) {
		exp = exp.trim();

		let value = findValueByPath(values, exp);
		if (typeof value !== 'object') {
			return value;
		}

		const opMatch = parseOp(exp);
		if (opMatch) {
			const { op, a, b } = opMatch;
			const valueA = parseExpression(a, values);

			// unary operators
			if (b === null) {
				// type conversion
				if (op === 'INT') {
					return parseInt(valueA);
				}
				if (op === 'FLOAT') {
					return parseFloat(valueA);
				}
				if (op === 'STRING') {
					return String(valueA);
				}
				// format
				if (op === 'SLUG') {
					return toSlug(valueA);
				}
				if (op === 'CURRENCY') {
					return new Intl.NumberFormat().format(valueA);
				}
				// date
				if (op === 'DATE_ISO') {
					return new Date(valueA).toISOString();
				}
				if (op === 'DATE_UTC') {
					return new Date(valueA).toUTCString();
				}
				// arithmetic
				if (op === 'ABS') {
					return Math.abs(valueA);
				}
				if (op === 'SQRT') {
					return Math.sqrt(valueA);
				}
				if (op === 'SUM') {
					if (valueA instanceof Array) {
						return valueA.reduce((partialSum, a) => partialSum + a, 0);
					}
					return 0;
				}
				if (op === 'AVERAGE') {
					if (valueA instanceof Array) {
						return valueA.reduce((partialSum, a) => partialSum + a, 0) / valueA.length;
					}
					return 0;
				}
				// boolean
				if (op === 'NULL') {
					return valueA === null;
				}
				if (op === 'NOT_NULL') {
					return valueA !== null;
				}
				if (op === 'NOT') {
					return !valueA;
				}
				// string
				if (op === 'STR_LEN') {
					return String(valueA).length;
				}
				if (op === 'LOWER') {
					return String(valueA).toLowerCase();
				}
				if (op === 'UPPER') {
					return String(valueA).toUpperCase();
				}
				if (op === 'TRIM') {
					return String(valueA).trim();
				}
				// array
				if (op === 'ARRAY_LEN') {
					if (valueA instanceof Array) {
						return valueA.length;
					}
					return 0;
				}
			} else if (op === 'ASUM') {
				// aggregated sum
				return (values[a] as unknown[])?.reduce((acc, item) => acc + parseExpression(b, item as typeof values), 0) ?? 0;
			} else {
				// binary operators
				const valueB = parseExpression(b, values);

				// arithmetic
				if (op === 'SUM') {
					return valueA + valueB;
				}
				if (op === 'SUBTRACT') {
					return valueA - valueB;
				}
				if (op === 'MULTIPLY') {
					return valueA * valueB;
				}
				if (op === 'DIVIDE') {
					return valueA / valueB;
				}
				if (op === 'REMAINDER') {
					return valueA % valueB;
				}
				if (op === 'ROUND') {
					return (valueA as number).toFixed(valueB);
				}
				if (op === 'MAX') {
					return Math.max(valueA, valueB);
				}
				if (op === 'MIN') {
					return Math.min(valueA, valueB);
				}
				if (op === 'POWER') {
					return Math.pow(valueA, valueB);
				}
				// string
				if (op === 'CONCAT') {
					return String(valueA) + String(valueB);
				}
				if (op === 'LEFT') {
					return String(valueA).slice(0, Number(valueB));
				}
				if (op === 'RIGHT') {
					return String(valueA).slice(-Number(valueB));
				}
				// boolean
				if (op === 'EQUAL') {
					return valueA === valueB;
				}
				if (op === 'NOT_EQUAL') {
					return valueA !== valueB;
				}
				if (op === 'GT') {
					return valueA > valueB;
				}
				if (op === 'GTE') {
					return valueA >= valueB;
				}
				if (op === 'LT') {
					return valueA < valueB;
				}
				if (op === 'LTE') {
					return valueA <= valueB;
				}
				if (op === 'AND') {
					return valueA && valueB;
				}
				if (op === 'OR') {
					return valueA || valueB;
				}
			}
		}

		// number literal
		if (!isNaN(parseFloat(exp))) {
			return parseFloat(exp);
		}
	}
	return '';
}

export function parseOp(exp: string) {
	const match = exp.match(/^([A-Z_]+)\((.+)\)$/);
	if (match) {
		const op = match[1] as string;
		const innerExp = match[2] as string;
		let braceCount = 0;
		for (let i = 0; i < innerExp.length; i += 1) {
			const c = innerExp[i];
			if (c === '(') braceCount += 1;
			if (c === ')') braceCount -= 1;
			if (c === ',' && braceCount === 0) {
				return {
					op,
					a: innerExp.slice(0, i),
					b: innerExp.slice(i + 1),
				};
			}
		}
		return {
			op,
			a: innerExp,
			b: null,
		};
	}
	return null;
}

export function toSlug(str: unknown) {
	if (typeof str !== 'string') {
		return '';
	}

	let res = str.replace(/^\s+|\s+$/g, ''); // trim
	res = res.toLowerCase();

	// remove accents
	const from = 'àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ';
	const to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy';
	for (let i = 0, l = from.length; i < l; i++) {
		res = res.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
	}

	res = res
		.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // collapse whitespace and replace by -
		.replace(/-+/g, '-'); // collapse dashes

	return res;
}
