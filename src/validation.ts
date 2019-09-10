/**
 * Default missing field message
 *
 * @param  field missing field name
 * @param  path path to missing field
 * @returns
 */
const defaultMissingMessage: MissingFieldMessage = function(field, path) {
  return `Field:'${path}' not provided.`
}

/**
 * Default failed test message
 *
 * @param  value test value
 * @param field field name
 * @param path  path to the field
 * @returns
 */
const defaultTestMessage: FailedTestMessage = function(value, field, path) {
  return `Field:'${path}' with value:${value} failed validation.`
}

/**
 * Validation class
 */
export class Validation {
  /**
   * Missing field messag
   */
  private readonly missingMsg: MissingFieldMessage | string

  /**
   * Failed test message
   */
  private readonly testMsg: FailedTestMessage | string

  /**
   * Test function
   */
  private readonly testFn: TestFunc

  /**
   *Creates an instance of Validationa
   * @param testFn Test function
   * @param testMessage Message if the test function has failed
   * @param isRequired if this validation is always required to run
   * @param missingMessage Message if the field to test is missing
   */
  constructor(
    testFn: TestFunc,
    testMessage: FailedTestMessage | string = defaultTestMessage,
    readonly isRequired: boolean = false,
    missingMessage: MissingFieldMessage | string = defaultMissingMessage
  ) {
    this.testMsg = testMessage
    this.missingMsg = missingMessage
    this.testFn = testFn
  }

  /**
   * Test the provided value
   *
   * @param value value to test
   * @param field field name
   * @param path path to the field
   * @param objUnderTest full object under test
   */
  test(value: any, field: string, path: string, objUnderTest: any): TestResult {
    return this.testFn(value, field, path, objUnderTest)
  }

  /**
   * Generate message for failed test
   *
   * @param value test value
   * @param field name
   * @param path to the field
   * @param full object under test
   * @param result of the test
   */
  message(
    value: any,
    field: string,
    path: string,
    objUnderTest: string,
    payload: TestPayload
  ): string {
    let msg = ''
    if (typeof this.testMsg !== 'string') {
      msg = this.testMsg(value, field, path, objUnderTest, payload)
    } else {
      msg = parseMsgString(value, field, path, this.testMsg)
    }
    return msg
  }

  /**
   * Generate missing message (if field to test is not provided)
   *
   * @param field field name
   * @param path path to the field
   * @param full object under test
   */
  missingMessage(field: string, path: string, objUnderTest: any): string {
    let msg = ''
    if (typeof this.missingMsg !== 'string') {
      msg = this.missingMsg(field, path, objUnderTest)
    } else {
      msg = parseMsgString('', field, path, this.missingMsg)
    }
    return msg
  }

  /**
   * Return new instance of validation with property isRequired
   * set to true. Other properties are copied from the previous instance
   * @returns new validation instance
   */
  required(): Validation {
    const newValidation = validation({
      test: this.testFn,
      message: this.testMsg,
      required: true,
      missingMessage: this.missingMsg,
    })

    return newValidation
  }
}

/**
 * Factory function to create new validation instance
 *
 * @param config Validation configuration
 * @returns Validation instance
 */
export function validation(config: ValidationConfig | TestFunc): Validation {
  // if function is passed in use it as test function
  if (typeof config === 'function') {
    return new Validation(config, undefined, false, undefined)
  }
  return new Validation(
    config.test,
    config.message,
    config.required,
    config.missingMessage
  )
}

/**
 * Parse message string format
 *
 * @param value test value
 * @param field field name
 * @param path path to field
 * @param msg custom message
 */
function parseMsgString(
  value: string,
  field: string,
  path: string,
  msg: string
): string {
  return msg
    .replace(/%value/gi, value)
    .replace(/%field/gi, field)
    .replace(/%path/gi, path)
}

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

/**
 * Function that is called for testing the particular field.
 *
 * @param value test value
 * @param field current field that is being tested
 * @param path full path to the field that is being tested
 * @param objUnderTest whole object that is being passed to the validate function
 */
export type TestFunc = (
  value: any,
  field: string,
  path: string,
  objUnderTest: any
) => TestResult

/** Possible results from the test function */
export type TestResult = boolean | TestPayload | Promise<boolean | TestPayload>

/**
 * Function that is called when test fails.
 * It should notify the user why the test failed.
 *
 * @param value test value
 * @param field current field that is tested
 * @param path full path to the field that is tested
 * @param objUnderTest whole object that is passed for testing
 * @param payload optional data passed from the test
 */
export type FailedTestMessage = (
  value: any,
  field: string,
  path: string,
  objUnderTest: any,
  payload?: TestPayload
) => string

/**
 * Function that is called when field that needs to be tested is not present on the testing object.
 *
 * @param field current field that is being tested
 * @param path full path to the field that is being tested
 * @param objUnderTest whole object that is being passed to the validate function
 */
export type MissingFieldMessage = (
  field: string,
  path: string,
  objUnderTest: any
) => string

/**
 * Configuration object for creating validation objects.
 *
 * @param test Test function for the validation @see Test
 * @param message Message for the user if validation fails @see TestMessage
 * @param missingMessage Message when field to be validated is not present @see MissingFieldMessage
 * @param required if the field to be validated must exist on the object to be validated.
 */
export interface ValidationConfig {
  test: TestFunc
  message?: string | FailedTestMessage
  missingMessage?: string | MissingFieldMessage
  required?: boolean
}

/**
 * Result of the validation.
 *
 * @param valid true if the whole object is validated successfully
 * @param errors validation results with errors @see FieldValidationResult
 * @param missing field validation results that are missing but not required @see FieldValidationResult
 * @param struct  object that represents the structure of testedObject with all test results.
 */
export interface ValidationResult<T = any> {
  valid: boolean
  errors: FieldValidationResult[]
  missing: FieldValidationResult[]
  struct: DeepValidated<T>
}

/**
 * Setup field validation result on every validator property
 * @see https://stackoverflow.com/questions/57739972/inferring-object-structure-and-type-of-object-properties/57740202#57740202
 */
type DeepValidated<T> = T extends object
  ? { [K in keyof T]: DeepValidated<T[K]> }
  : FieldValidationResult

/**
 * Result object for single field validation.
 *
 * @param error  true if validation failed
 * @param missing  true if the field to be validated is missing from the test object and the field is required
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
