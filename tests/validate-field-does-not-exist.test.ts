import { validate, validation } from '../src/index'

describe('When the field does not exist', () => {
  describe('and it is required', () => {
    test('validate at depth 0', () => {
      const testObj = {}
      const validationSpy = jest.fn()
      const testValidators = {
        email: validation({ test: validationSpy, required: true }),
      }
      const emailError = {
        error: true,
        missing: true,
        value: null,
        field: 'email',
        path: 'email',
      }
      const expectedResult = {
        valid: false,
        errors: [emailError],
        missing: [emailError],
        struct: {
          email: emailError,
        },
      }

      const result = validate(testValidators, testObj)

      expect(validationSpy).not.toBeCalled()
      expect(result).toMatchObject(expectedResult)
    })
    test('validate at depth 0 with multiple validators', () => {
      const testOne = jest.fn(() => true)
      const testTwo = jest.fn(() => true)
      const validationOne = validation({
        test: testOne,
      })
      const validationTwo = validation({
        test: testTwo,
        required: true,
      })
      const testObj = {}
      const testValidators = {
        email: [validationOne, validationTwo],
      }
      const emailError = {
        error: true,
        missing: true,
        value: null,
        field: 'email',
        path: 'email',
      }
      const expectedResult = {
        valid: false,
        errors: [emailError],
        missing: [emailError],
        struct: {
          email: emailError,
        },
      }

      const result = validate(testValidators, testObj)

      expect(testOne).not.toBeCalled()
      expect(testTwo).not.toBeCalled()
      expect(result).toMatchObject(expectedResult)
    })

    test('validate at depth 3', () => {
      const testObj = {}
      const validationSpy = jest.fn()
      const testValidators = {
        d1: {
          d2: {
            d3: {
              email: validation({ test: jest.fn(), required: true }),
            },
          },
        },
      }
      const emailError = {
        error: true,
        missing: true,
        value: null,
        field: 'email',
        path: 'd1.d2.d3.email',
      }
      const expectedResult = {
        valid: false,
        errors: [emailError],
        missing: [emailError],
        struct: {
          d1: {
            d2: {
              d3: {
                email: emailError,
              },
            },
          },
        },
      }

      const result = validate(testValidators, testObj)

      expect(validationSpy).not.toBeCalled()
      expect(result).toMatchObject(expectedResult)
    })

    test('validate at depth 3 with multiple validators', () => {
      const testObj = {}
      const testOne = jest.fn(() => true)
      const testTwo = jest.fn(() => true)
      const validationOne = validation({
        test: testOne,
        required: true,
      })
      const validationTwo = validation({
        test: testTwo,
        required: true,
      })
      const testValidators = {
        d1: {
          d2: {
            d3: {
              email: [validationOne, validationTwo],
            },
          },
        },
      }
      const emailError = {
        error: true,
        missing: true,
        value: null,
        field: 'email',
        path: 'd1.d2.d3.email',
      }
      const expectedResult = {
        valid: false,
        errors: [emailError],
        missing: [emailError],
        struct: {
          d1: {
            d2: {
              d3: {
                email: emailError,
              },
            },
          },
        },
      }

      const result = validate(testValidators, testObj)

      expect(testOne).not.toBeCalled()
      expect(testTwo).not.toBeCalled()
      expect(result).toMatchObject(expectedResult)
    })
  })

  describe('When the field is not required', () => {
    test('validate at depth 0', () => {
      const testObj = {}
      const testValidators = {
        email: validation({ test: () => true }),
      }
      const emailError = {
        error: false,
        missing: true,
        field: 'email',
        message: "Field:'email' not provided.",
        path: 'email',
        value: null,
      }
      const expectedResult = {
        valid: true,
        errors: [],
        missing: [emailError],
        struct: {
          email: emailError,
        },
      }

      const result = validate(testValidators, testObj)

      expect(result).toEqual(expect.objectContaining(expectedResult))
    })
    test('validate at depth 0 with multiple validators', () => {
      const testOne = jest.fn(() => true)
      const testTwo = jest.fn(() => true)
      const validationOne = validation({
        test: testOne,
      })
      const validationTwo = validation({
        test: testTwo,
      })
      const testObj = {}
      const testValidators = {
        email: [validationOne, validationTwo],
      }
      const emailError = {
        error: false,
        missing: true,
        field: 'email',
        message: "Field:'email' not provided.",
        path: 'email',
        value: null,
      }
      const expectedResult = {
        valid: true,
        errors: [],
        missing: [emailError],
        struct: {
          email: emailError,
        },
      }

      const result = validate(testValidators, testObj)

      expect(testOne).not.toBeCalled()
      expect(testTwo).not.toBeCalled()
      expect(result).toEqual(expect.objectContaining(expectedResult))
    })

    test('validate at depth 3', () => {
      const testObj = {}
      const validationSpy = jest.fn()
      const testValidators = {
        d1: {
          d2: {
            d3: {
              email: validation({ test: validationSpy }),
            },
          },
        },
      }
      const emailError = {
        error: false,
        missing: true,
        field: 'email',
        message: "Field:'d1.d2.d3.email' not provided.",
        path: 'd1.d2.d3.email',
        value: null,
      }
      const expectedResult = {
        valid: true,
        errors: [],
        missing: [emailError],
        struct: {
          d1: {
            d2: {
              d3: {
                email: emailError,
              },
            },
          },
        },
      }

      const result = validate(testValidators, testObj)

      expect(validationSpy).not.toBeCalled()
      expect(result).toEqual(expect.objectContaining(expectedResult))
    })

    test('validate at depth 3 with multiple validators', () => {
      const testObj = {}
      const testOne = jest.fn(() => true)
      const testTwo = jest.fn(() => true)
      const validationOne = validation({
        test: testOne,
      })
      const validationTwo = validation({
        test: testTwo,
      })
      const testValidators = {
        d1: {
          d2: {
            d3: {
              email: [validationOne, validationTwo],
            },
          },
        },
      }
      const emailError = {
        error: false,
        missing: true,
        field: 'email',
        message: "Field:'d1.d2.d3.email' not provided.",
        path: 'd1.d2.d3.email',
        value: null,
      }
      const expectedResult = {
        valid: true,
        errors: [],
        missing: [emailError],
        struct: {
          d1: {
            d2: {
              d3: {
                email: emailError,
              },
            },
          },
        },
      }

      const result = validate(testValidators, testObj)

      expect(testOne).not.toBeCalled()
      expect(testTwo).not.toBeCalled()
      expect(result).toEqual(expect.objectContaining(expectedResult))
    })
  })
})
