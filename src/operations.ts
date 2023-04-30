import { findValueByPath } from './utils';

export function parseExpression(exp: string, values: Record<string, any>, defaultValues: Record<string, any> = {}): any {
	if (values) {
		exp = exp.trim();

		// literal string
		if (exp.startsWith('"') && exp.endsWith('"')) {
			return exp.slice(1, -1).replace(/\\"/g, '"');
		}

		let { value, found } = findValueByPath(values, exp);

		if(!found || value === null) {
			let defaults = findValueByPath(defaultValues, exp);
			if(defaults.found) {
				return defaults.value;
			}
		}

		if (found) {
			return value;
		}

		// Dynamic variables
		if (exp === '$NOW') {
			return new Date();
		}
		if (exp.startsWith('$CURRENT_USER')) {
			if (exp === '$CURRENT_USER') {
				return values.__currentUser?.id;
			}
			return findValueByPath({ $CURRENT_USER: values.__currentUser }, exp).value;
		}

		const opMatch = parseOp(exp);
		if (opMatch) {
			const { op, args } = opMatch;

			// unary operators
			if (args.length === 1) {
				const valueA = parseExpression(args[0], values, defaultValues);
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
				if (op === 'DATE') {
					return new Date(valueA);
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
				if (['YEAR', 'MONTH', 'GET_DATE', 'DAY', 'HOURS', 'MINUTES', 'SECONDS', 'TIME'].includes(op)) {
					if (valueA instanceof Date) {
						const op2func = {
							YEAR: 'getFullYear',
							MONTH: 'getMonth',
							GET_DATE: 'getDate',
							DAY: 'getDay',
							HOURS: 'getHours',
							MINUTES: 'getMinutes',
							SECONDS: 'getSeconds',
							TIME: 'getTime',
						};
						return valueA[op2func[op]]();
					}
					return 0;
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
			} else if (op === 'ASUM' && args.length === 2) {
				// aggregated sum
				return (values[args[0]] as unknown[])?.reduce((acc, item) => acc + parseExpression(args[1], item as typeof values, {}), 0) ?? 0;
			} else if (args.length === 2) {
				// binary operators
				const valueA = parseExpression(args[0], values, defaultValues);
				const valueB = parseExpression(args[1], values, defaultValues);

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
			} else if (args.length === 3) {
				if (op === 'IF') {
					if (parseExpression(args[0], values, defaultValues) === true) {
						return parseExpression(args[1], values, defaultValues);
					}
					return parseExpression(args[2], values, defaultValues);
				}
			}
		}

		// number literal
		if (!isNaN(parseFloat(exp))) {
			return parseFloat(exp);
		}

		throw new Error(`Cannot parse expression: ${exp}`);
	}
	return '';
}

export function parseOp(exp: string): {
	op: string;
	args: string[];
} | null {
	const match = exp.trim().match(/^([A-Z_]+)\((.+)\)$/);
	if (match) {
		const args = [];
		const op = match[1] as string;
		const innerExp = match[2] as string;

		let braceCount = 0,
			i = 0,
			j = 0,
			inQuote = false,
			escapeNext = false;
		for (; i < innerExp.length; i += 1) {
			const c = innerExp[i];
			if (c === '(' && !inQuote) braceCount += 1;
			else if (c === ')' && !inQuote) braceCount -= 1;
			else if (c === ',' && !inQuote && braceCount === 0) {
				args.push(innerExp.slice(j, i).trim());
				j = i + 1;
			}
			else if (c === '"' && !escapeNext) inQuote = !inQuote;
			else if (c === '\\' && inQuote) {
				escapeNext = true;
				continue;
			}
			escapeNext = false;
		}
		if (j < i) {
			args.push(innerExp.slice(j, i).trim());
		}

		return { op, args };
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
