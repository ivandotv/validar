import {
  FieldValidationResult,
  TestPayload,
  TestResult,
  Validation,
  ValidationResult,
} from './validation'
import deepForEach from 'deep-for-each'
import isPromise from 'p-is-promise'
import set from 'set-value'
import undefSafe from 'undefsafe'

/**
 * Validate object asynchronously.
 * Use this only if your validation tests are asynchronous
 *
 * @param  validators object of validators for the test
 * @param  objUnderTest object to test
 * @returns {Promise<ValidationResult<T>>}
 */
export function validateAsync<T>(
  validators: T,
  objUnderTest: any
): Promise<ValidationResult<T>> {
  const r = runValidations(validators, objUnderTest, true)
  return r as Promise<ValidationResult<T>>
}

/**
 * Validate object synchronosly
 *
 * @param validators object of validators for the test
 * @param objUnderTest object to test
 * @returns {ValidationResult<T>}
 */
export function validate<T>(
  validators: T,
  objUnderTest: any
): ValidationResult<T> {
  const r = runValidations(validators, objUnderTest, false)
  return r as ValidationResult<T>
}

/**
 * Internal function that actually runs the validations
 *
 * @param  validators object of validator tests
 * @param objUnderTest object to test
 * @param isAsync if function should be run async
 * @returns {(ValidationResult<T> | Promise<ValidationResult<T>)}
 */
function runValidations<T>(
  validators: T,
  objUnderTest: any,
  isAsync: boolean
): ValidationResult<T> | Promise<ValidationResult<T>> {
  // final result that is to be returned
  const finalResult: ValidationResult = {
    valid: true,
    errors: [],
    missing: [],
    struct: {},
  }
  // object to construct fields for every validator that is tested
  const objStruct = {}

  // promise that gets returned from async version
  let finalPromise: Promise<ValidationResult>
  let resolveLater: (r: ValidationResult) => void // promise resolve when all async tasks are done
  let rejectLater: (e: Error) => void // reject if any of async tasks throws

  // pool of errors - guard for async functions to not populate the array with multiple errors for the same field
  const errorPool: { [key: string]: FieldValidationResult } = {}
  const asyncTests: Array<Promise<FieldValidationResult>> = [] // array of async tests

  // if in async mode initialize fine promise
  if (isAsync) {
    finalPromise = new Promise((resolve, reject) => {
      resolveLater = resolve
      rejectLater = reject
    })
  }
  // traverse validator object
  deepForEach(
    validators,
    (
      validation: Validation | Validation[],
      field: string,
      subject: object | [],
      path: string
    ) => {
      // subject can be "Object" or "Array"
      // if it's an array we skip it becase we iterate on arrays later
      if (!Array.isArray(subject)) {
        // take the path from the validator object and see if there is something on the same path on object under test
        var valueToTest: any | undefined = undefSafe(objUnderTest, path)
        // do we have value to test for this validator?
        var testValueIsUndefined: boolean = typeof valueToTest === 'undefined'

        // result of the test
        let testResult: FieldValidationResult

        // if false, we have a value, lets run some validators
        if (!testValueIsUndefined) {
          // if it walks like a duck...
          if (Array.isArray(validation) || isValidation(validation)) {
            validation = wrapInArray(validation)

            for (const test of validation) {
              // run all tests for current field
              const validationResult = runTest(
                test,
                valueToTest,
                field,
                path,
                objUnderTest
              )
              // validation result returns promise
              if (isPromise(validationResult)) {
                // throw if function not in async mode
                if (!isAsync) {
                  throw new Error(
                    'Async validation test encountered. Use "validateAsync".'
                  )
                }
                // create new promise an push it on stack of promises
                asyncTests.push(
                  closeOverPromise(
                    test,
                    validationResult,
                    valueToTest,
                    field,
                    objUnderTest,
                    path,
                    objStruct,
                    finalResult.errors,
                    errorPool
                  )
                )
              } else {
                // validation has returned final value, build test result
                testResult = buildTestResult(
                  test,
                  validationResult,
                  valueToTest,
                  field,
                  objUnderTest,
                  path
                )
                // create path for the test result on the struct object
                set(objStruct, path, testResult)
                // if error push to errors array
                if (testResult.error === true) {
                  finalResult.errors.push(testResult)
                  errorPool[testResult.path] = testResult
                  // break on first error for the field
                  break
                }
              }
            }
          }
        } else {
          // value to test is undefined (field on the object to test does not exist)
          // check if validations for the field are required
          if (Array.isArray(validation) || isValidation(validation)) {
            validation = wrapInArray(validation)

            for (const test of validation) {
              testResult = buildMissingField(
                test,
                field,
                path,
                objUnderTest,
                test.isRequired
              )

              // create path for the test result on the struct object
              set(objStruct, path, testResult)

              // if test is required don't check other tests for the field
              // mark the field as error and break
              if (test.isRequired) {
                finalResult.errors.push(testResult)
                break
              }
            }
            // no tests are required
            // just push to missing array
            finalResult.missing.push(testResult)
          }
        }
      }
    }
  )

  if (asyncTests.length > 0) {
    // we have some async tests and we need to wait
    Promise.all(asyncTests)
      .then(() => {
        finalResult.struct = objStruct
        if (finalResult.errors.length > 0) {
          finalResult.valid = false
        }
        resolveLater(finalResult)
      })
      .catch(reason => {
        rejectLater(reason)
      })
    return finalPromise
  } else {
    // there is no async tests return immediately
    finalResult.struct = objStruct
    if (finalResult.errors.length > 0) {
      finalResult.valid = false
    }
    // async function version can be called with no async tests
    // then return a promise
    if (isAsync) {
      return Promise.resolve(finalResult)
    }
    return finalResult
  }
}

/**
 * Wrap validation object in array
 *
 * @param {(Validation | Validation[])} validation
 * @returns {Validation[]}
 */
function wrapInArray(validation: Validation | Validation[]): Validation[] {
  if (!Array.isArray(validation)) {
    validation = [validation]
  }
  return validation
}

/**
 * Run validation test
 *
 * @param  validation
 * @param testValue
 * @param field
 * @param path
 * @param objUnderTest
 * @returns test result can be a promise
 */
function runTest(
  validation: Validation,
  testValue: any,
  field: string,
  path: string,
  objUnderTest: any
): TestResult {
  return validation.test(testValue, field, path, objUnderTest)
}

/**
 *
 * Build result object for the tested field
 *
 * @param validation
 * @param testResult
 * @param testValue
 * @param field
 * @param objUnderTest
 * @param path
 */
function buildTestResult(
  validation: Validation,
  testResult: boolean | TestPayload,
  testValue: any,
  field: string,
  objUnderTest: string,
  path: string
): FieldValidationResult {
  let success: boolean, payload: any
  const r: FieldValidationResult = {
    error: false,
    missing: false,
    value: testValue,
    path: path,
    field: field,
    message: '',
  }

  if (!isBoolean(testResult)) {
    success = testResult.valid
    if (typeof testResult.payload !== 'undefined') {
      payload = testResult.payload
    }
  } else {
    success = testResult
  }

  if (!success) {
    r.error = true
    r.message = validation.message(
      testValue,
      field,
      path,
      objUnderTest,
      payload
    )
  }
  return r
}

/**
 * Build result for the field when field is required but it is missing
 * @param validation
 * @param field
 * @param path
 * @param objUnderTest
 * @param isError
 */
function buildMissingField(
  validation: Validation,
  field: string,
  path: string,
  objUnderTest: any,
  isError: boolean
): FieldValidationResult {
  return {
    error: isError,
    missing: true,
    value: null,
    field: field,
    path: path,
    message: validation.missingMessage(field, path, objUnderTest),
  }
}

/**
 * Check if value is boolean
 *
 * @param  v value to test
 */
function isBoolean(v: any): v is boolean {
  return v === true || v === false
}

/**
 * Wrap async validation test is custom promise
 *
 * @param  validation validation
 * @param  testPromiseResult validation test promise
 * @param  testValue value for validation
 * @param  field validation field
 * @param  objUnderTest whole object under test
 * @param  path path to the field on the object
 * @param  objStruct  validation result objec structure
 * @param  fieldErrors array of field validation results that are errors
 * @param  errorPool pull of already created errors
 *

 */
function closeOverPromise(
  validation: Validation,
  testPromiseResult: Promise<boolean | TestPayload>, // test promise
  testValue: any,
  field: string,
  objUnderTest: any,
  path: string,
  objStruct: any,
  fieldErrors: FieldValidationResult[],
  errorPool: { [key: string]: FieldValidationResult }
): Promise<FieldValidationResult> {
  let resolveLater: (r: FieldValidationResult) => void // promise resolve when all async tasks are done
  let rejectLater: (e: Error) => void // reject if any of async tasks throws

  // wrap test promise
  const promiseWrap: Promise<FieldValidationResult> = new Promise(
    // fix for someone passing Promise.resolve() for async test
    // https://stackoverflow.com/a/53953341/1489487
    (resolve, reject) => {
      resolveLater = resolve
      rejectLater = reject
    }
  )

  testPromiseResult
    .then(result => {
      const constructedResult = buildTestResult(
        validation,
        result,
        testValue,
        field,
        objUnderTest,
        path
      )
      if (constructedResult.error) {
        // push only if not already pushed
        if (typeof errorPool[constructedResult.path] === 'undefined') {
          errorPool[constructedResult.path] = constructedResult
          fieldErrors.push(constructedResult)
        }
      }
      set(objStruct, path, constructedResult)
      resolveLater(constructedResult)
    })
    .catch(reason => {
      rejectLater(reason)
    })
  return promiseWrap
}

/**
 * Test if object is validation
 *
 * @param  v object to test
 */
function isValidation(v: any): v is Validation {
  return typeof v.test !== 'undefined' && typeof v.message !== 'undefined'
}
