import { Ref } from "vue";

export function parseExpression(exp: string, values: Ref | undefined): any {
	if (values) {
		exp = exp.trim();
		if (exp in values.value) {
			return values.value[exp];
		}

		const opMatch = parseOp(exp);
		if (opMatch) {
			const { op, a, b } = opMatch;
			const valueA = parseExpression(a, values);

			// unary operators
			if (b === null) {
				if (op === 'INT') {
					return parseInt(valueA);
				}
				if (op === 'FLOAT') {
					return parseFloat(valueA);
				}
				if (op === 'STRING') {
					return String(valueA);
				}
				if (op === 'SLUG') {
					return toSlug(valueA);
				}
				if (op === 'CURRENCY') {
					return new Intl.NumberFormat().format(valueA);
				}
			} else {
				// binary operators
				const valueB = parseExpression(b, values);
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
				if (op === 'CONCAT') {
					return String(valueA) + String(valueB);
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

function parseOp(exp: string) {
	const match = exp.match(/^([A-Z]+)\((.+)\)$/);
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
		}
	}
	return null;
}

function toSlug(str: string) {
	str = str.replace(/^\s+|\s+$/g, ''); // trim
	str = str.toLowerCase();

	// remove accents
	const from = 'àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ';
	const to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy';
	for (let i = 0, l = from.length; i < l; i++) {
		str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
	}

	str = str
		.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // collapse whitespace and replace by -
		.replace(/-+/g, '-'); // collapse dashes

	return str;
}
