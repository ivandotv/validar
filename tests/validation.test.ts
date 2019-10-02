import { validate, validation } from '../src/index'

describe('Validation instance creation', () => {
  test('do not throw an error when a function is the only parameter', () => {
    const fieldValue = 'ivan'
    const validationTest = validation(() => false)
    expect(() => {
      validate({ name: validationTest }, { name: fieldValue })
    }).not.toThrow()
  })

  test('accept function as the only parameter', () => {
    const fieldValue = 'ivan'
    const testObj = { name: fieldValue }
    const validators = { name: validation(() => false) }
    const nameError = {
      error: true,
      missing: false,
      value: fieldValue,
      field: 'name',
      path: 'name',
    }
    const testResult = {
      valid: false,
      errors: [nameError],
      missing: [],
      struct: {
        name: nameError,
      },
    }

    const result = validate(validators, testObj)

    expect(result).toMatchObject(testResult)
  })
  test('return new instance when calling the "required" method', () => {
    const testValidation = validation({
      test: jest.fn(),
      message: jest.fn(),
    })
    const newValidation = testValidation.required()

    expect(newValidation).not.toBe(testValidation)
    expect(newValidation.isRequired).toBe(true)
  })
  test('make validation required when calling the "required" method ', () => {
    const testValidation = validation({
      test: jest.fn(() => true),
    }).required()
    const testObj = {
      name: 'Ivan',
    }
    const testValidators = {
      d1: {
        nonExistant: testValidation,
      },
    }
    const nonExistantError = {
      error: true,
      missing: true,
      value: null,
      path: 'd1.nonExistant',
      field: 'nonExistant',
      message: "Field:'d1.nonExistant' not provided.",
    }
    const expectedResult = {
      valid: false,
      errors: [nonExistantError],
      missing: [nonExistantError],
      struct: {
        d1: {
          nonExistant: nonExistantError,
        },
      },
    }

    const result = validate(testValidators, testObj)

    expect(result).toEqual(expect.objectContaining(expectedResult))
  })
})

describe('Test function', () => {
  test('gets called with correct parameters', () => {
    const testFuncSpy = jest.fn(() => true)
    const validationFail = validation({
      test: testFuncSpy,
    })
    const propValue = 'test@test.com'
    const testObj = {
      d1: {
        email: propValue,
      },
    }
    const testValidators = {
      d1: {
        email: validationFail,
      },
    }

    validate(testValidators, testObj)

    expect(testFuncSpy).toBeCalledWith(
      propValue,
      'email',
      'd1.email',
      expect.objectContaining(testObj)
    )
  })
})

describe('Test message', () => {
  test('when no custom message is provided use the default message', () => {
    const validationFail = validation({
      test: () => {
        return false
      },
    })
    const messageSpy = jest.spyOn(validationFail, 'message')
    const propValue = 'test@test.com'
    const testObj = {
      d1: {
        email: propValue,
      },
    }
    const testValidators = {
      d1: {
        email: validationFail,
      },
    }

    validate(testValidators, testObj)

    expect(messageSpy).toBeCalledWith(
      propValue,
      'email',
      'd1.email',
      expect.objectContaining(testObj),
      undefined
    )
  })

  test('use custom message with custom payload', () => {
    const messageSpy = jest.fn()
    const payload = {
      a: 'a',
      b: 'b',
    }
    const validationFail = validation({
      test: () => {
        return {
          valid: false,
          payload: payload,
        }
      },
      message: messageSpy,
    })
    const propValue = 'test@test.com'
    const testObj = {
      d1: {
        email: propValue,
      },
    }
    const testValidators = {
      d1: {
        email: validationFail,
      },
    }

    validate(testValidators, testObj)

    expect(messageSpy).toBeCalledWith(
      propValue,
      'email',
      'd1.email',
      expect.objectContaining(testObj),
      expect.objectContaining(payload)
    )
  })

  test('pass in custom message as a string', () => {
    const customMsg =
      'Message test path:%path, field:%field, value:%value|path:%path, field:%field, value:%value'
    const validationFail = validation({
      test: () => {
        return false
      },
      message: customMsg,
    })
    const propValue = 'test@test.com'
    const testObj = {
      d1: {
        email: propValue,
      },
    }
    const testValidators = {
      d1: {
        email: validationFail,
      },
    }

    const result = validate(testValidators, testObj)

    const resultMessage =
      'Message test path:d1.email, field:email, value:test@test.com|path:d1.email, field:email, value:test@test.com'
    expect(result.errors[0].message).toBe(resultMessage)
  })
})
describe('Missing field message', () => {
  test('use the default message when no message is provided', () => {
    const testValidation = validation({
      test: jest.fn(() => true),
      required: true,
    })
    const validationSpy = jest.spyOn(testValidation, 'missingMessage')
    const testObj = {
      name: 'Ivan',
    }
    const testValidators = {
      d1: {
        nonExistant: testValidation,
      },
    }

    validate(testValidators, testObj)

    expect(validationSpy).toBeCalledWith(
      'nonExistant',
      'd1.nonExistant',
      expect.objectContaining(testObj)
    )
  })
  test('use custom message', () => {
    const customMissingMessage = jest.fn()
    const testValidation = validation({
      test: jest.fn(() => true),
      message: jest.fn(),
      missingMessage: customMissingMessage,
      required: true,
    })
    const testObj = {
      name: 'Ivan',
    }
    const testValidators = {
      d1: {
        nonExistant: testValidation,
      },
    }

    validate(testValidators, testObj)

    expect(customMissingMessage).toBeCalledWith(
      'nonExistant',
      'd1.nonExistant',
      expect.objectContaining(testObj)
    )
  })
  test('pass in a custom message as a string', () => {
    const customMsg =
      'Message test path:%path, field:%field |path:%path, field:%field'
    const validationFail = validation({
      test: () => {
        return true
      },
      missingMessage: customMsg,
      required: true,
    })
    const testObj = {}
    const testValidators = {
      email: validationFail,
    }

    const result = validate(testValidators, testObj)

    const resultMessage =
      'Message test path:email, field:email |path:email, field:email'
    expect(result.errors[0].message).toBe(resultMessage)
  })
})
