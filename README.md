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
2. In the **Interface** panel, choose **Computed** interface. There are 8 options:
    1. **Template**: Similar to M2M interface, determine how the field is calculated. Learn more about syntax in the next section.
    2. **Field Mode**: Choose how the value is displayed.
        - **null**: Default option. Show an input with the computed value but still allow manual editing.
        - **Display Only**: Show the computed value but will not save it to the database. Usually used for alias fields.
        - **Read Only**: Show an input with the computed value and disallow manual editing.
    3. **Prefix**: a string to prefix the computed value.
    4. **Suffix**: a string to suffix the computed value.
    5. **Custom CSS**: an object for inline style binding. Only works with **Display Only** and **Read Only** mode. You can use this option to customize the appearance of the computed value such as font size, color, etc.
    6. **Debug Mode**: Used for debugging the template. It will show an error message if the template is invalid. It will also log to console the result of each component of the template.
    7. **Compute If Empty**: Compute the value if the field is empty. This is useful if you want a value to be computed once such as the created date or a unique ID.
    8. **Initial Compute**: Compute the value when opening the form. This is useful if you want to compute a value based on the current date or other dynamic values.

# Syntax

The template consists of 2 elements: **plain strings** & **expressions**.
- **Plain** strings are string literal, often used for text interpolation.
- **Expressions** can contains operators, field names, numbers & strings. They must be enclosed by `{{` and `}}`.

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

Literal strings are enclosed by double quotes (`"`):
```
{{ CONCAT(file, ".txt") }}
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
`DATE_STR(a)` | transform date or date-like object to string with format "YYYY-MM-DD"
`TIME_STR(a)` | transform date or date-like object to string with format "HH:mm:ss"
`YEAR(a)` | get year of a date object, similar to `getFullYear`
`MONTH(a)` | get month of a date object, similar to `getMonth`
`GET_DATE(a)` | get date of a date object, similar to `getDate`
`DAY(a)` | get day of a date object, similar to `getDay`
`HOURS(a)` | get hours of a date object, similar to `getHours`
`MINUTES(a)` | get minutes of a date object, similar to `getMinutes`
`SECONDS(a)` | get seconds of a date object, similar to `getSeconds`
`TIME(a)` | get time of a date object, similar to `getTime`

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
`CEIL(a)` | returns the smallest integer greater than or equal to `a`.
`FLOOR(a)` | returns the largest integer less than or equal to `a`.
`ROUND(a)` | rounds to the nearest integer.
`ROUND(a, n)` | rounds number `a` to `n` number of decimals, (`ROUND(1.23, 1) = 1.2`).
`MAX(a, b)` | max value between `a` and `b`.
`MAX(arr)` | max value of an array of numbers.
`MIN(a, b)` | min value between `a` and `b`.
`MIN(arr)` | min value of an array of numbers.
`POWER(a, b)` | a^b
`EXP(a)` | returns `e^a`, where `e` is Euler's number.
`LOG(a)` | returns the natural logarithm (base `e`) of `a`.

### String

Operator | Description
--- | ---
`STR_LEN(str)` | length of string
`LOWER(str)` | to lower case
`UPPER(str)` | to upper case
`TRIM(str)` | removes whitespace at the beginning and end of string.
`CONCAT(strA, strB)` | concat 2 strings `strA` and `strB`.
`LEFT(str, count)` | extract `count` characters from the beginning of the string `str`.
`RIGHT(str, count)` | extract `count` characters from the end of the string `str`.
`MID(str, startAt, count)` | extract `count` characters from `startAt` position of the string `str`.
`ENCODE_URL_COMPONENT(str)` | encode string to URL component.
`REPT(str, count)` | repeat string `count` times.
`JOIN(arr, separator)` | join an array of strings with `separator`.
`SPLIT(str, separator)` | split string `str` by `separator` to an array of strings.
`SEARCH(str, keyword)` | search `keyword` in `str` and return the position of the first occurrence. Return -1 if not found.
`SEARCH(str, keyword, startAt)` | search `keyword` in `str` and return the position of the first occurrence after `startAt`. Return -1 if not found.
`SUBSTITUTE(str, old, new)` | replace all occurrences of `old` in `str` with `new`.

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

### Condition

Operator | Description
--- | ---
`IF(A, B, C)` | return `B` if `A` is `true`, otherwise `C`
`IFS(A1, B1, A2, B2, ..., An, Bn)` | return `Bi` if `Ai` is the first to be `true`, if none of `Ai` is `true`, return `null`

## Dynamic Variables

There are 2 dynamic variables available that you can use in the expressions:
- `$NOW`: return the current Date object. Example: `{{ YEAR($NOW) }}` returns the current year.
- `$CURRENT_USER`: return the current user's id. Example: `{{ EQUAL($CURRENT_USER, user) }}` checks if the `user` field is the current user.
