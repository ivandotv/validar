---
layout: default
title: Required property
parent: Creating Validations
nav_order: 4
---

## Required property

## TODO - required sa multiple validatorima i objasniti zasto da se

## validator sa required postavi prvi

If this property is `true` object under test must have a field with the value other than `undefined`.

If the field is not present that will be considered an error and the object under test won't pass the validation.

In case that the field doesn't exist on the test object and `Validation` instance `required` property is `false`, the test will not be an error, but `FieldValidationResult` _`missing`_ field will be set to `true`.

You can also call required on an already created `Validation` instance and it will return the clone of the instance with the `required` property set to `true`.

### Examples

```js
import { validate, validation } from 'validation-runner'

const testEmail = validation(validator.isEmail)

// create new instance of Validation with required property set to true
// this instance has the same test and same messages as `testEmail`
const testEmailRequired = isEmail.required()

// testEmail !== testEmailRequired

const testName = validation({
    test:()=>true,
    required:true
})

const testObj = {
  name:'Nick',
  nick: 'blade001', // this one will never be tested because there is no validation test for it on the `validators` object
  //no personalEmail
  //no workEmail
}

const validators = {
  name: testName,// this test will be successful
  personalEmail: testEmail, // this one will just be marked as missing
  workEmail: testEmailRequired, // this one will be an error
}

//the test

let result = validate(testObj, validators)

// how the result should look like
result = {
    valid:false, // because of the workEmail test
    errors[errorObj], // <- errorObj === struct.workEmail
    struct:{
        personalEmail:{
            error:false,// false because it is not required
            missing:true,
            value:null,
            field:'personalEmail',
            path:'personalEmail',
            message:'Field:"personalEmail" not provided.'
        },
        workEmail:{
            error:true // true because it is required
            missing:true,
            value:null,
            field:'workEmail',
            path:'personalEmail',
            message:'Field:"workEmail" not provided.'
        }
    }
}

// result.errors[0] === result.struct.workEmail

```
