# Validar

[![CircleCI](https://img.shields.io/circleci/build/github/ivandotv/validar/master)](https://circleci.com/gh/ivandotv/validar)
[![Codecov](https://img.shields.io/codecov/c/github/ivandotv/validar)](https://codecov.io/gh/ivandotv/validar)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/validar)
![NPM](https://img.shields.io/npm/l/validar)

Don't complicate your object schema validation.

Validate objects synchronously or asynchronously.

## Install

```js
npm install validar
```

## Introduction

**Validation runner doesn't contain any validation tests**, it is meant to be used with tried and tested validation libraries such as [Validator.js](https://github.com/validatorjs/validator.js) or you can write your own tests very easily.

## Usage

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
  lastName: isAlpha,
  occupation: isAlpha.required(),
  location: {
    country: [isString, isValidCountry], //multiple validators
    city: isCityInValidCountry,
  },
}
// isAlpha, isString, isValidCoutry, isCityInValidCountry are validation tests (more on that later)
```

Let’s validate the person object

```js
// this is the validation step
const result = validate(personValidators, person)
```

Let’s look at the result

person object will fail validation because:

- `occupation` field does not exist on person object and it is required to exist.
- `location.city` is not a valid city in Canada

Note: `person` object will not fail validation because it lacks `lastName` field. The reason is because that field is not marked as `required` on the validation object. Validation object and object under test don’t have to have matching structure ( unless you want to ).

The result:

```js
result = {
    valid:false,
    errors:[errorObj1,errorObj2],
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
            value:null,
            field:'occupation',
            path:'occupation',
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
// result.errors[0] = result.struct.occupation
// result.errors[1] = result.struct.location.city
// result.missing[0] = result.struct.occuption
```

- _Errors_ are conveniently storred in the errors array on the result object.
- _Missing_ fields are stored in the missing array on the result object.

[runkit example](https://runkit.com/ivandotv/validar)

### Asynchronous validation

Validation tests can be asynchronous (talk to the database etc..) in that case you just use the `validateAsync` function and handle the promise that is returned when all validation tests are done.

```js
validateAsync(personValidators, person).then(result => {
  console.log(result)
})
```

asynchronous [runkit](https://runkit.com/ivandotv/async-validar-example) example

Check out documentation for more information about:

- [Exploring result structure](https://ivandotv.github.io/validar/validate/validation-result)
- [Creating validation tests](https://ivandotv.github.io/validar/validation/test-function)
- [Asynchronous validation](https://ivandotv.github.io/validar/validate/validate-async)

##### Author

- **Ivan Vlatković**

##### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
