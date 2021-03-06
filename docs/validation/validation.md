---
layout: default
title: Creating Validations
nav_order: 2
has_children: true
permalink: /validation
has_toc: false
---

## Creating validation instances

`Validation` instances should be constructed via the `validation` factory function.

`validation` function accepts a configuration object with the following signature:

```js
/**
 * Configuration object for creating validation objects.
 *
 * @param test Test function for the validation @see Test
 * @param message Message for the user if validation fails @see TestMessage
 * @param missingMessage Message when field to be validated is not present @see MissingFieldMessage
 * @param required if the field to be validated must exist on the object to be validated.
 */
export interface ValidationConfig {
  test: Test<any>
  message?: string | FailedTestMessage
  missingMessage?: string | MissingFieldMessage
  required?: boolean
}
```

### Examples

```js
const isEmail = validation({
  test: (value, field, path, objUnderTest) => {
    // test if value is valid email
    return true
  },
  message: 'Email not valid',
  missingMessage: 'Email field not provided',
  required: true,
})
```

Or it can accept a single paramter that is the test function:

```js
const isEmail = validation((value,field,path,objecUnderTest){
  // test if value is valid email
  return true
})

```

That is all that is required for creating a minimal validation test. Other configuration options will have their default values set.

Learn more about all configuration parameters:

- [Test function](test-function)
- [Test message](test-message)
- [Missing message](missing-message)
- [Required property](required-property)
