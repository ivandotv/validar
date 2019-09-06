---
layout: default
title: Missing field message
parent: Creating Validations
nav_order: 3
---

## Missing field message

Optional property, similar to the `message` property.
The only difference is that this property is used when the field that needs to be tested doesn't exist on the object that is being validated.

```js
/**
 * @param field current field that is being tested
 * @param path full path to the field that is being tested
 * @param objUnderTest whole object that is being passed to the validate function
 */
export type MissingFieldMessage = (
  field: string,
  path: string,
  objUnderTest: any
) => string
```

default value is:

```js
'Field:'${path}' not provided.'
```

### Example

You will notice that the difference between `missingMessage` and [test message](test-message) is that this function does not accept the `value` and `payload`. This is because the test is never executed (because the field on the object to be validated does not exists)

```js
import { validate, validation } from 'validation-runner'

// custom string
const email = validation({
  test: () => true,
  missingMessage: 'Value for Email on path: %path not provided',
})

// custom function
const testCityInCountry = validation({
  test: () => true,
  missingMessage: (field, path, objUnderTest) => {
    return `Field: ${field} on path: ${path} not provided`
  },
})

// default value will be used
const emailTest = validation({
  test: () => true
}
// message will be the default string:
// 'Field: ${path} not provided.'
```
