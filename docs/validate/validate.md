---
layout: default
title: Validating data
nav_order: 1
has_children: true
permalink: /validate
has_toc: false
---

Validation is done by matching **validation object** against the **object to validate**

`validate` function is used for validating the object containing the data. It accepts two parameters:

- object containing the validation tests
- object to be validated

```js
const result = validate(validationObject, testObject)
```

Given an object with the data:

```js
const person ={
  name:'Adam'
  location:{
    country:'Canada',
    city:'Montreal099',
  }
}
// Note: fields on the testing object can be nested any number of levels.
```

And validation object like this:

```js
const personValidators = {
  name: isAlpha,
  occupation: isAlpha.required(),
  location: {
    country: [isString, isValidCountry], //multiple validators
    city: isCityInValidCountry,
  },
}
// isAlpha, isString, isValidCountry,isCityInValidCountry are validation tests (more on that later)
```

Let’s validate the person object

```js
// this is the validation step
const result = validate(personValidators, person)
```

Let’s look at the result:

person object will fail validation because:

- occupation field does not exist on person object and it is required to exist.
- location.city is not a valid city in Canada

Note: person object will not fail validation because it lacks lastName field. The reason is because that field is not marked as required on the validation object. Validation object and testing object don’t have to have matching structure ( unless you want to ).

```js
const result = {
  valid: false,
  errors: [errorObj1, errorObj2],
  struct: {
    name: {
      error: false,
      missing: false,
      value: 'Adam',
      field: 'name',
      path: 'name',
    },
    occupation: {
      error: true,
      missing: true,
      value: null,
      field: 'occupation',
      path: 'occupation',
      message: 'Field "occupation" not provided',
    },
    location: {
      country: {
        error: false,
        missing: false,
        value: 'Canada',
        field: 'country',
        path: 'location.country',
      },
      city: {
        error: true,
        missing: false,
        value: 'Montreal099',
        field: 'city',
        path: 'location.city',
        message: 'Field "location.city" is not a valid city in Canada',
      },
    },
  },
}

// result.errors[0] = result.struct.occupation
// result.errors[1] = result.struct.location.city
// result.missing[0] = result.struct.occuption
```

- _Errors_ are conveniently storred in the errors array on the result object.
- _Missing_ fields are stored in the missing array on the result object.

[runkit example](https://runkit.com/ivandotv/validar)

### Multiple validations for one field

In case of the `person.location.country` we have multiple validators, that means that all validator tests (`isString`,`isValidCountry`)
must pass for the field to be marked as valid.
As soon as the first test for the field returns `false` field will be marked as invalid and all other tests for that field will not run.

```js
const personValidators = {
  location: {
    country: [isString, isValidCountry], //multiple validators
  },
}
```

Async Example

Validation tests can be asynchronous (talk to the database etc..) in that case you just use the `validateAsync` function.

```js
validateAsync(personValidators, person).then(result => {
  console.log(result)
})
```

Read more about in the docs:

- [Exploring result structure](validation-result)
- [Creating validation test](validation)
- [Asynchronous validation](validate-async)
