import {
  FailedTestMessage,
  Validation,
  validate,
  validation,
} from '../src/index'

let validationFail: Validation, validationSuccess: Validation

const message: FailedTestMessage = (
  value: any,
  key: string,
  path: string
): string => {
  return `${value}|${key}|${path}`
}

beforeEach(() => {
  validationFail = validation({
    test: () => {
      return {
        valid: false,
      }
    },
    message: message,
  })

  validationSuccess = validation({
    test: () => {
      return {
        valid: true,
      }
    },
    message: message,
  })
})
describe('Field exist', () => {
  describe('and validation is a success', () => {
    test('field at depth 0', () => {
      const propValue = 'test@test.com'
      const testObj = {
        email: propValue,
      }
      const testValidators = {
        email: validationSuccess,
      }
      const expectedResult = {
        valid: true,
        errors: [],
        missing: [],
      }

      const result = validate(testValidators, testObj)

      expect(result).toEqual(expect.objectContaining(expectedResult))
    })
    test('field at depth 0 - multiple validators', () => {
      const propValue = 'test@test.com'
      const testObj = {
        email: propValue,
      }
      const testValidators = {
        email: [
          validationSuccess,
          validationSuccess.required(),
          validationSuccess,
        ],
      }
      const expectedResult = {
        valid: true,
        errors: [],
        missing: [],
      }

      const result = validate(testValidators, testObj)

      expect(result).toEqual(expect.objectContaining(expectedResult))
    })

    test('field at depth 3', () => {
      const propValue = 'test@test.com'
      const testObj = {
        d1: {
          d2: {
            d3: {
              email: propValue,
            },
          },
        },
      }
      const testValidators = {
        d1: {
          d2: {
            d3: {
              email: validationSuccess,
            },
          },
        },
      }
      const expectedResult = {
        valid: true,
        errors: [],
        missing: [],
        struct: {
          d1: {
            d2: {
              d3: {
                email: {
                  error: false,
                  missing: false,
                  value: propValue,
                  message: '',
                  field: 'email',
                  path: 'd1.d2.d3.email',
                },
              },
            },
          },
        },
      }

      const result = validate(testValidators, testObj)

      expect(result).toEqual(expect.objectContaining(expectedResult))
    })

    test('field at depth 3 - multiple validators', () => {
      const propValue = 'test@test.com'
      const testObj = {
        d1: {
          d2: {
            d3: {
              email: propValue,
            },
          },
        },
      }
      const validationTwo = validationSuccess.required()
      const validationThree = validationSuccess.required()
      const spyOne = jest.spyOn(validationSuccess, 'test')
      const spyTwo = jest.spyOn(validationTwo, 'test')
      const spyThree = jest.spyOn(validationThree, 'test')
      const testValidators = {
        d1: {
          d2: {
            d3: {
              email: [validationSuccess, validationTwo, validationThree],
            },
          },
        },
      }
      const expectedResult = {
        valid: true,
        errors: [],
        missing: [],
        struct: {
          d1: {
            d2: {
              d3: {
                email: {
                  error: false,
                  missing: false,
                  field: 'email',
                  value: propValue,
                  path: 'd1.d2.d3.email',
                  message: '',
                },
              },
            },
          },
        },
      }

      const result = validate(testValidators, testObj)

      expect(spyOne).toBeCalledTimes(1)
      expect(spyTwo).toBeCalledTimes(1)
      expect(spyThree).toBeCalledTimes(1)
      expect(result).toEqual(expect.objectContaining(expectedResult))
    })
  })

  describe('and validation is a failure', () => {
    test('field at depth 0 ', () => {
      const propValue = 'test@test.com'
      const testObj = {
        email: propValue,
      }
      const testValidators = {
        email: validationFail,
      }
      const emailPropResult = {
        error: true,
        missing: false,
        value: propValue,
        field: 'email',
        path: 'email',
        message: message(propValue, 'email', 'email', testObj),
      }
      const expectedResult = {
        valid: false,
        errors: [emailPropResult],
        missing: [],
        struct: {
          email: emailPropResult,
        },
      }

      const result = validate(testValidators, testObj)

      expect(result).toEqual(expect.objectContaining(expectedResult))
    })

    test('field at depth 0 - multiple validators', () => {
      const propValue = 'test@test.com'
      const testObj = {
        email: propValue,
      }
      const validationTwo = validationFail.required()
      const validationThree = validationFail.required()
      const spyOne = jest.spyOn(validationFail, 'test')
      const spyTwo = jest.spyOn(validationTwo, 'test')
      const spyThree = jest.spyOn(validationThree, 'test')
      const testValidators = {
        email: [validationFail, validationFail, validationTwo, validationThree],
      }
      const emailPropResult = {
        error: true,
        missing: false,
        value: propValue,
        field: 'email',
        path: 'email',
        message: message(propValue, 'email', 'email', testObj),
      }
      const expectedResult = {
        valid: false,
        errors: [emailPropResult],
        missing: [],
        struct: {
          email: emailPropResult,
        },
      }

      const result = validate(testValidators, testObj)

      expect(spyOne).toBeCalledTimes(1)
      expect(spyTwo).toBeCalledTimes(0)
      expect(spyThree).toBeCalledTimes(0)
      expect(result).toEqual(expect.objectContaining(expectedResult))
    })
    test('field at depth 3 - multiple validators', () => {
      const propValue = 'test@test.com'
      const testObj = {
        d1: {
          d2: {
            d3: {
              email: propValue,
            },
          },
        },
      }
      const validationTwo = validationFail.required()
      const validationThree = validationFail.required()
      const spyOne = jest.spyOn(validationFail, 'test')
      const spyTwo = jest.spyOn(validationTwo, 'test')
      const spyThree = jest.spyOn(validationThree, 'test')
      const testValidators = {
        d1: {
          d2: {
            d3: {
              email: [validationFail, validationTwo, validationThree],
            },
          },
        },
      }
      const emailPropResult = {
        error: true,
        missing: false,
        value: propValue,
        field: 'email',
        path: 'd1.d2.d3.email',
        message: message(propValue, 'email', 'd1.d2.d3.email', testObj),
      }
      const expectedResult = {
        valid: false,
        errors: [emailPropResult],
        missing: [],
        struct: {
          d1: {
            d2: {
              d3: {
                email: emailPropResult,
              },
            },
          },
        },
      }

      const result = validate(testValidators, testObj)

      expect(spyOne).toBeCalledTimes(1)
      expect(spyTwo).toBeCalledTimes(0)
      expect(spyThree).toBeCalledTimes(0)
      expect(result).toEqual(expect.objectContaining(expectedResult))
    })
    test('field at depth 3', () => {
      const propValue = 'test@test.com'
      const testObj = {
        d1: {
          d2: {
            d3: {
              email: propValue,
            },
          },
        },
      }
      const testValidators = {
        d1: {
          d2: {
            d3: {
              email: validationFail,
            },
          },
        },
      }
      const emailPropResult = {
        error: true,
        missing: false,
        value: propValue,
        field: 'email',
        path: 'd1.d2.d3.email',
        message: message(propValue, 'email', 'd1.d2.d3.email', testObj),
      }
      const expectedResult = {
        valid: false,
        errors: [emailPropResult],
        missing: [],
        struct: {
          d1: {
            d2: {
              d3: {
                email: emailPropResult,
              },
            },
          },
        },
      }

      const result = validate(testValidators, testObj)

      expect(result).toEqual(expect.objectContaining(expectedResult))
    })
  })
})
