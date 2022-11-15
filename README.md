[![npm version](https://badge.fury.io/js/directus-extension-computed-interface.svg)](https://badge.fury.io/js/directus-extension-computed-interface)

# Introduction
A [Directus](https://github.com/directus/directus) extension for automatically calculating the value of a field based on other fields of the same item, on the client side.

- **Support templating, arithmetic operations**. Concat strings, sum, subtract, multiply, modulo, convert to slug, currency, etc.
- **Can be used as an alias field**.
- **Calculation is performed on the client side**, so it would not work if the item is created/updated via direct API calls or hooks.
- **Lightweight**. No third-party libraries.

![](./screenshots/screenshot1.jpeg)
![](./screenshots/screenshot2.jpeg)

# Installation
```
npm i directus-extension-computed-interface
```

# Get Started
1. Go to **Settings**, create a new field with type string or number.
2. In the **Interface** panel, choose **Computed** interface. There are 2 options:
    1. **Template**: Similar to M2M interface, determine how the field is calculated. Learn more about syntax in the next section.
    2. **Display Only**: If the field is an alias and you don't want to save to the database, enable this.

# Syntax
## Examples
Sum 2 numbers:
```
{{ SUM(a, b) }}
```

Multiply 2 numbers:
```
{{ MULTIPLY(a, b) }}
```

Convert string to slug:
```
{{ SLUG(title) }}
```

Text interpolation:
```
/{{ SLUG(title) }}-{{ id }}
```

Complex calculation:
```
{{ SUM(MULTIPLY(2, x), b) }}
```

## Available operators

### Type conversion

Operator | Description
--- | ---
`INT(a)` | convert to integer
`FLOAT(a)` | convert to float
`STRING(a)` | convert to string
`DATE(a)` | convert to date

### Format

Operator | Description
--- | ---
`SLUG(a)` | transform string to slug (e.g. "This is a title" &#8594; "this-is-a-title")
`CURRENCY(a)` | format number to currency (e.g. 3000 &#8594; "3,000")

### Date

Operator | Description
--- | ---
`DATE_ISO(a)` | transform date or date-like object to ISO string
`DATE_UTC(a)` | transform date or date-like object to UTC string

### Arithmetic

Operator | Description
--- | ---
`ABS(a)` | absolute
`SQRT(a)` | square root
`SUM(a)` | sum an array of numbers
`SUM(a, b)` | a + b
`AVERAGE(a)` | average value of an array of number
`SUBTRACT(a, b)` | a - b
`MULTIPLY(a, b)` | a * b
`DIVIDE(a, b)` | a / b
`REMAINDER(a, b)` | a % b
`ROUND(a, n)` | round number `a` to `n` number of decimals, similar to `toFixed`
`MAX(a, b)` | max value
`MIN(a, b)` | min value
`POWER(a, b)` | a^b

### String

Operator | Description
--- | ---
`STR_LEN(a)` | length of string
`LOWER(a)` | to lower case
`UPPER(a)` | to upper case
`TRIM(a)` | removes whitespace at the beginning and end of string.
`CONCAT(a, b)` | concat 2 strings
`LEFT(a, b)` | extract `b` characters from the beginning of the string.
`RIGHT(a, b)` | extract `b` characters from the end of the string.

### Boolean

Operator | Description
--- | ---
`NULL(a)` | check is null
`NOT_NULL(a)` | check is not null
`NOT(a)` | logical NOT
`EQUAL(a, b)` | a = b
`NOT_EQUAL(a, b)` | a <> b
`GT(a, b)` | a > b
`GTE(a, b)` | a >= b
`LT(a, b)` | a < b
`LTE(a, b)` | a <= b
`AND(a, b)` | logical AND
`OR(a, b)` | logical OR

### Array

Operator | Description
--- | ---
`ARRAY_LEN(a)` | length of array

### Relational

Operator | Description
--- | ---
`ASUM(a, b)` | Aggregated sum of O2M field. For example: calculate shopping cart total price with `ASUM(products, MULTIPLY(price, quantity))` where `products` is the O2M field in the shopping cart and `price` & `quantity` are 2 fields of `products`.


# Limitation
- Cannot parse literal strings (`{{ 's' }}`).
- Cannot use relational fields (`{{ user.name }}`).
