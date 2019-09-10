---
layout: default
title: Validation result
parent: Validating data
nav_order: 2
has_toc: false
---

Both `validate` and `validateAsync` functions return the same result object with four properties.

```js
/**
 * Result of the validation.
 *
 * @param valid true if whole object is validated successfully
 * @param errors validation results with errors @see FieldValidationResult
 * @param missing field validations that are missing on the test object  @see FieldValidationResult
 * @param struct  object that represents the structure of the validation object with all test results.
 */
export interface ValidationResult<T = any> {
  valid: boolean
  errors: FieldValidationResult[]
  missing: FieldValidationResult[]
  struct: DeepValidated<T>
}

const test = {
    name:'Same'
    lastName:'Fisher'
}

const validators = {
    name:checkName,
    lastName:[checkStringLength,checkLastName],//array of validators
    profession:[checkProfession]
}
// checkName,checkLastName,checkStringLengthand,checkProfession are validation objects (more on that later)
const result = validate(validators,test)

```

Let’s say that `name` is validated successfully, `lastName` failed validation and `profession` field does not exist on the tested object so it is missing (but that will not cause the final result to be invalid because that field is not marked as required via validator)

This would be the result:

```js
const result = {
  valid: false, // failed validaton,
  errors: [errorObj], // same as result.struct.lastName
  missing: [missingObj], //same as result.struct.profession
  struct: {
    name: {
      error: false,
      missing: false,
      value: 'Sam',
      field: 'name',
      path: 'name',
      message: '', //empty message because test was successful
    },
    lastName: {
      error: true,
      missing: false,
      value: 'Fisher',
      field: 'lastName',
      path: 'lastName', //deeply nested path could look like this: person.profile.lastName
      message: `Field:'${path}' with value:${value} failed validation.`,
    },
    profession: {
      error: false, // false because it is not required
      missing: true, // because there is no `profession` field on the `person` object
      value: null, //  there is no value
      field: 'profession',
      path: 'profession',
      message: `Field:'${path}' not provided.`,
    },
  },
}
```

As you can see there is a pattern to the `struct` object properties. For every field that exists on the `validators` object, this structure will be returned:

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
  message: string
  value: any
}
```

All errors in the validation result are also conveniently stored in the `errors` array.

```js
// same object as result.struct.occupation
result.errors[0] = {
  error: true,
  missing: true,
  value: null,
  field: 'occupation',
  path: 'occupation',
  message: 'Field "occupation" not provided',
}
// same object as result.struct.location.city
result.errors[1] = {
  error: true,
  missing: false,
  value: 'Montreal099',
  field: 'city',
  path: 'location.city',
  message: 'Field "location.city" is not a valid city in Canada',
}
```

Missing fields are storred in the `missing` array.

```js
// same object as result.struct.occupation
result.missing[0] = {
    error:true,
    missing:true, // field is not present on the tested object
    value:null,
    field:'occupation',
    path:'occupation'
    message:'Field "occupation" not provided'
}
```

You will notice that the `occupation` object is stored both in
the `errors` and in the `missing` array on the `result` object.
This is because `occupation` field is missing but it is required to exist, that makes it an error.
By default validation fields are not required to exist on the object that is being tested. Only when they marked as `required` test object will fail validation.

Read more about [`required` property](validation/required)
