# Validation Runner

Run your validations like a bos. Synchronosly or asynchronosly.

Works great with [Validator.js](https://github.com/validatorjs/validator.js)

[![CircleCI](https://circleci.com/gh/ivandotv/validation-runner/tree/master.svg?style=svg)](https://circleci.com/gh/ivandotv/validation-runner/tree/master)
[![codecov](https://codecov.io/gh/ivandotv/validation-runner/branch/master/graph/badge.svg)](https://codecov.io/gh/ivandotv/validation-runner)
![dependabot enabled](https://flat.badgen.net/dependabot/dependabot/dependabot-core/?icon=dependabot)

## Introduction

**Validation runner doesn't contain any validation tests**. It is meant to be used with tried and tested validation libraries such as [Validator.js](https://github.com/validatorjs/validator.js) or you can write your own tests very easily.

## Example

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

// isAlpha, isString, isValidCoutry are validation tests (more on that later)

// note: validation object doesn't have to match testing object structure
```

Let's validate the `person` object

```js
// this is the validation step
const result = validate(person, personValidators)

// `person` object will fail validation because:
// - occupation  -> field does not exist on `person` object and it's required to exist
// - location.city -> not a valid city in Canada

// this is the result structure from the validation step
result = {
    valid:false,
    errors[errorObj1,errorObj2],
    struct:{
        name:{
            error:false,
            missing:false,
            value:'Adam',
            field:'name',
            path:'name'
        }
        occupation:{
            error:true,
            missing:true,
            value:null
            field:'occupation',
            path:'occupation'
            message:'Field "occupation" not provided'
        }
        location:{
            country:{
                error:false,
                missing:false,
                value:'Canada',
                field:'country',
                path:'location.country'
            },
            city:{
                error:true,
                missing:false,
                value:'Montreal099'
                field:'city',
                path:'location.city',
                message:'Field "location.city" is not a valid city in Canada'
            }
        }
    }
}
```

## Async Example

Validation tests can be asynchronous (talk to the database etc..) in that case you just use the `validateAsync` function.

```js
validateAsync(person, personValidators).then(result => {
  console.log(result)
})
```

Read more about in the docs:

- Exploring result structure
- Creating validation test
- Asynchronous validation

//TODO - ovo ide u poseban fajl
Also all errors are conveniently storred in the `errors` array on the `result` object

```js
// same object as result.struct.occupation
result.errors[0] = {
    error:true,
    missing:true,
    value:null
    field:'occupation',
    path:'occupation'
    message:'Field "occupation" not provided'
}
// same object as result.struct.location.city
result.errors[1] = {
    error:true,
    missing:false,
    value:'Montreal099'
    field:'city',
    path:'location.city',
    message:'Field "location.city" is not a valid city in Canada'
}

```

For every field that exists on the validator object, this structure will be returned

```js
/**
 * Result object for single field validation.
 *
 * @param error  true if validation failed
 * @param missing  true if field to be validated is missing from the test object and the field is required
 * @param value  value of the field that was tested
 * @param field object field name
 * @param path  full path to the field on the object e.g user.profile.address
 * @param message  field validation message
 */
export interface FieldValidationResult {
  error: boolean
  missing: boolean
  field: string
  path: string
  message?: string
  value?: any
}
```

## Usage

There are two pieces to this validation puzzle.

- Object to validate
- Object that holds validations

```js
const result = validate(testObject, validationObject)
```

Validation object fields should be constructed from `Validation` instances. These instances should be created via `validation` factory function.

```js
import { validate, validation }  from 'validation-runner'
import validator from 'validator';

const isEmail = validation(
    test:(value,key,path,objUnderTest)=>{
        //you can do your own tests or use validator.js
        return validator.isEmail(value)
    }
)
//or shorter
const isEmail = validation(validator.isEmail)

//object that holds validations
const validationObject = {
  email: isEmail
}

const result = validate(testObj,validationObject)
```

Note: for the shorter version of validation creation you can use any test function that accepts `value` as first parameter and returns `boolean` result if test is successfull or not.

There are other optional properties for the validation function.
Please refer to the wiki for more info.
