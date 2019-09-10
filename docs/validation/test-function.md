---
layout: default
title: Test function
parent: Creating Validations
nav_order: 1
---

## Test function

```js
/**
 * @param value test value
 * @param field current field that is being tested
 * @param path full path to the field that is being tested
 * @param objUnderTest whole object that is being passed to the validate function
 */
export type Test<T extends TestResult> = (
  value: any,
  field: string,
  path: string,
  objUnderTest: any
) => T
```

Function to test the values coming from the object under validation.

```js
const { validate, validation } = require('validar')
//object to validate
const testObj = {
  profile: {
    name: 'Mike',
  },
}

const stringLengthTest = (value, field, path, objectUnderTest) => {
  // value -> 'Mike'
  // field -> 'name'
  // path -> 'profile.name'
  // objectUnderTest  -> reference to the testObj
  return typeof value === 'string' && value.length > 5
}

//assemble the validation object
const validationObject = {
  profile: {
    name: validation(stringLengthTest),
  },
}

const result = validate(validationObject, testObj)
```

function parameters:

- `value`: value to test
- `field`: name of the field that is under the test
- `path`: path to the field under test. If the field is deeply nested full path could be something like `person.profile.email`
- `objUnderTest`: reference to the object that is currently being tested. Here you can access all other properties of the object (so in case you have a `city` field that you are currently testing, you can also look at the `country` field to determine if the `city` is valid).

Any function that accepts `value` as the first parameter and returns `boolean` or [expected object](#return-values) can be used.

## Async test function

Test function can be asynchronous, you just need to return a `promise` that will eventually be resolved to the `boolean` or object that conforms to the [expected object](#return-values) that can be returned from the function.

```js
const stringLengthTest = (value, field, path, objectUnderTest) => {
  return new Promise((resolve, reject) => {
    // resolve later - maybe query the DB...
    resolve(typeof value === 'string' && value.length > 5)
  })
}
```

**Do not `reject` the promise if the test is negative** (e.g length is less than 5) just resolve the promise with the value of `false`
Using `reject()` will bubble up and will have to be handled with the validator function `validateAsync().catch()`

When using asynchronous tests you should use `validateAsync()` function

```js
const { validate, validation } = require('validar')

//object to validate
const testObj = {
  profile: {
    name: 'Mike',
  },
}

const stringLengthTest = (value, field, path, objectUnderTest) => {
  // value -> 'Mike'
  // field -> 'name'
  // path -> 'profile.name'
  // objectUnderTest  -> reference to the testObj
  return new Promise((resolve, reject) => {
    // resolve later - maybe query the DB...
    resolve(typeof value === 'string' && value.length > 5)
  })
}

//assemble the validation object
const validationObject = {
  profile: {
    name: validation(stringLengthTest),
  },
}

const result = validateAsync(testObj, validationObject)
  .then(result => {
    console.log(result)
  })
  .catch(error => {
    //something went wrong during the validation, promise has timedout
    // or some async test rejected the promise
  })
```

## Return values

```js
export type TestResult = boolean | TestPayload | Promise<boolean | TestPayload>

/**
 * Object that is optionally returned from the test function.
 *
 * @param valid true if test is successful
 * @param payload custom object with arbitrary data
 */
export interface TestPayload {
  readonly valid: boolean
  readonly payload?: any
}
```

Test function can return few different values

- `boolean`: `true` if test is successfull.
- Special object `TestPayload` with the following properties.
  - `valid`: `boolean` -> `true` if test is successfull.
  - `payload`: object that can have any arbitrary data added, and that object will be passed to the [`test message`](test-message) function in case that the test is unsuccessfull (function returns `false` or `promise` resolves to `false`)

```js
const stringLengthTest = (value, field, path, objectUnderTest) => {
  const r = typeof value === 'string' && value.length > 5
  return {
    valid: r,
    payload: {
      whatever: 'whatever',
    },
  }
}
```

Async example:

```js
const stringLengthTest = (value, field, path, objectUnderTest) => {
  return new Promise((resolve, reject) => {
    const r = typeof value === 'string' && value.length > 5
    resolve({
      valid: r,
      payload: {
        propA: 'propA',
        propB: 'propB',
      },
    })
  })
}
```

Then if the test is a failure [`message`]('test-message') function will be called with the result of the test and the payload.

```js
// message function will only be called if the test is a failure
const message = (value,field,path,objUnderTest,payload)=>{
    //value -> test value
    // payload -> {
            // propA:'propA',
            // propB:'propB'
        // }
    return 'Custom failure message'
    }
}
```
