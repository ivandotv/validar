---
layout: default
title: Asynchronous validation
parent: Validating data
nav_order: 1
---

Validation tests can be asynchronous (talk to the database etc..) in that case you just use the `validateAsync` function and handle the promise that is returned when all validation test are done.

```js
const { validate, validation } = require('validar')

const person = {
  name: 'Adam',
}

const asyncNameTest = (value, field, path, objectUnderTest) => {
  return new Promise((resolve, reject) => {
    // resolve later - maybe query the DB...
    resolve(typeof value === 'string' && value.length > 5)
  })
}

const validators = {
  name: validation(asyncNameTest),
}

validateAsync(validators, person)
  .then(result => {
    console.log(result)
  })
  .catch(error => {
    console.log('something went wrong')
  })
```

Result of the validation will always be accessible via `then` ( resolved promise), even when validation fails. `Catch` block us used for errors that come from the async tests (if database is unavailable, connection timeout etc)

asynchronous runkit example

Check out documentation for more information about:

- [Exploring result structure](https://ivandotv.github.io/validar/validate/validation-result)
- [Creating validation tests](https://ivandotv.github.io/validar/validation/test-function)
