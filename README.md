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

Operator | Description
--- | ---
`SUM(a, b)` | a + b
`SUBTRACT(a, b)` | a - b
`MULTIPLY(a, b)` | a * b
`DIVIDE(a, b)` | a / b
`REMAINDER(a, b)` | a % b
`ROUND(a, n)` | round number `a` to `n` number of decimals, similar to `toFixed`
`CONCAT(a, b)` | concat 2 strings
`INT(a)` | convert to integer
`FLOAT(a)` | convert to float
`STRING(a)` | convert to string
`SLUG(a)` | transform a string to a slug (e.g. "This is a title" &#8594; "this-is-a-title")
`CURRENCY(a)` | format number a to currency (e.g. 3000 &#8594; "3,000")

# Limitation
- Cannot parse literal strings (`{{ 's' }}`).
- Cannot use relational fields (`{{ user.name }}`).
