---
layout: default
title: Test message
parent: Creating Validations
nav_order: 2
---

## Test message

This property is used when the associated test fails. The return value will be used on the `FieldValidationResult` object as the message for the failed validation.

```js
/**
 * @param value test value
 * @param field current field that is tested
 * @param path full path to the field that is tested
 * @param objUnderTest whole object that is passed for testing
 * @param payload optional data passed from the test
 */
export type FailedTestMessage = (
  value: any,
  field: string,
  path: string,
  objUnderTest: any,
  payload?: TestPayload
) => string
```

- This property is optional
- It can be a string or a function that returns string.

If not provided, default string is:

```js
'Field: ${path} with value:${value} failed validation.'
```

In case of a simple string there is a special syntax that you can use:

- `%field` object filed name
- `%path` path to the object field
- `%value` value of the field

These values are the same as the values passed to the function

```js
'Field %field on the path: %path with value: %value is not valid'
```

### Example

```js
const  { validate, validation }  = require('validar')

// custom string
const v = validation({
  test: () => false,
  message: 'Field %field on path: %path with value: %value is not valid',
})

// custom function
const testCityInCountry = validation({
  test: (value,field) => {
    // value -> 'Sidney'
    // todo test if the value(city) is in the country Canada
    return {
      valid: false,
      payload: {
        country: 'Canada',
      },
    }
  },
  message: (value, field, path, objUnderTest, payload) => {
    // value -> 'Sidney'
    return `City: ${value} is not located in ${payload.coutry}`
  },
})

// default value will be used
const emailTest = validation({
  test: () => false
}
// message will be the default string:
// 'Field: ${path} with value:${value} failed validation.'
```
