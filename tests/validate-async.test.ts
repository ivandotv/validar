import {
  FailedTestMessage,
  validate,
  validateAsync,
  validation,
} from '../src/index'

const message: FailedTestMessage = (
  value: any,
  key: string,
  path: string
): string => {
  return `${value}|${key}|${path}`
}
describe('Async validation', () => {
  test('if trying to use an async test in a synchronous validation, throw an error ', () => {
    const asyncTest = validation({
      test: async (): Promise<boolean> => {
        return new Promise<boolean>(resolve => {
          resolve(true)
        })
      },
    })
    const testObj = {
      name: 'ivan',
    }
    const validators = {
      name: asyncTest,
    }

    expect(() => {
      validate(validators, testObj)
    }).toThrow()
  })
  test('returned result is a promise', () => {
    const testObj = {
      nick: 'iki',
    }
    const validators = {
      nick: validation({ test: jest.fn(() => true) }),
    }

    const p = validateAsync(validators, testObj)
    // eslint-disable-next-line
    expect(p).toBeInstanceOf(Promise)
  })

  test('returned result is resolved', async () => {
    const asyncTest = validation({
      test: async (): Promise<boolean> => {
        return new Promise<boolean>(resolve => {
          resolve(false)
        })
      },
      message: message,
    })

    const testObj = {
      name: 'ivan',
      nick: 'iki',
    }
    const validators = {
      name: asyncTest,
      nick: validation({ test: jest.fn(() => true) }),
    }
    const nameError = {
      error: true,
      missing: false,
      field: 'name',
      path: 'name',
      value: 'ivan',
      message: message('ivan', 'name', 'name', testObj),
    }
    const expectedResult = {
      valid: false,
      errors: [nameError],
      missing: [],
      struct: {
        name: nameError,
        nick: {
          error: false,
          missing: false,
          field: 'nick',
          path: 'nick',
          value: 'iki',
          message: '',
        },
      },
    }

    return validateAsync(validators, testObj).then(validationResult => {
      expect(validationResult).toEqual(expect.objectContaining(expectedResult))
    })
  })
  test('return rejected promise, when validation fails', async () => {
    const rejectReason = 'http-error'
    const asyncTest = validation({
      test: async (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
          reject(rejectReason)
        })
      },
    })
    const testObj = {
      name: 'ivan',
      nick: 'iki',
    }
    const validators = {
      name: asyncTest,
      nick: validation({ test: jest.fn(() => true) }),
    }

    return validateAsync(validators, testObj).catch(validationResult => {
      expect(validationResult).toBe(rejectReason)
    })
  })
  describe('Multiple async validators for the same field', () => {
    test('all validations are a success', async () => {
      const asyncTest = validation({
        test: async (): Promise<boolean> => {
          return new Promise(resolve => {
            resolve(true)
          })
        },
        message: message,
      })
      const asyncTestTwo = validation({
        test: async (): Promise<boolean> => {
          return new Promise(resolve => {
            resolve(true)
          })
        },
        message: message,
      })
      const testObj = {
        name: 'ivan',
        nick: 'iki',
      }
      const validators = {
        name: [asyncTest, asyncTestTwo],
        nick: validation({ test: jest.fn(() => true) }),
      }
      const expectedResult = {
        valid: true,
        errors: [],
        missing: [],
        struct: {
          name: {
            error: false,
            missing: false,
            field: 'name',
            path: 'name',
            value: 'ivan',
            message: '',
          },
          nick: {
            error: false,
            missing: false,
            field: 'nick',
            path: 'nick',
            value: 'iki',
            message: '',
          },
        },
      }
      return validateAsync(validators, testObj).then(validationResult => {
        expect(validationResult).toEqual(
          expect.objectContaining(expectedResult)
        )
      })
    })
    test('all validations are a failure', async () => {
      const asyncTest = validation({
        test: async (): Promise<boolean> => {
          return new Promise(resolve => {
            resolve(false)
          })
        },
        message: message,
      })
      const testTwoSpy = jest.fn(() => false)
      const testTwo = validation({
        test: testTwoSpy,
        message: message,
      })
      const testObj = {
        name: 'ivan',
      }
      const validators = {
        name: [asyncTest, testTwo],
      }
      const nameError = {
        error: true,
        missing: false,
        field: 'name',
        path: 'name',
        value: 'ivan',
        message: message('ivan', 'name', 'name', testObj),
      }
      const expectedResult = {
        valid: false,
        errors: [nameError],
        missing: [],
        struct: {
          name: nameError,
        },
      }

      return validateAsync(validators, testObj).then(validationResult => {
        expect(validationResult).toEqual(
          expect.objectContaining(expectedResult)
        )
        expect(testTwoSpy).toBeCalled()
      })
    })

    test('multiple async validation failures', async () => {
      const asyncTest = validation({
        test: async (): Promise<boolean> => {
          return new Promise(resolve => {
            resolve(false)
          })
        },
        message: message,
      })
      const testTwo = validation({
        test: async (): Promise<boolean> => {
          return new Promise(resolve => {
            resolve(false)
          })
        },
        message: message,
      })
      const testObj = {
        name: 'ivan',
      }
      const validators = {
        name: [asyncTest, testTwo],
      }

      const nameError = {
        error: true,
        missing: false,
        field: 'name',
        path: 'name',
        value: 'ivan',
        message: message('ivan', 'name', 'name', testObj),
      }
      const expectedResult = {
        valid: false,
        errors: [nameError],
        missing: [],
        struct: {
          name: nameError,
        },
      }

      return validateAsync(validators, testObj).then(validationResult => {
        expect(validationResult).toEqual(
          expect.objectContaining(expectedResult)
        )
      })
    })

    test('try validation when field does not exist', async () => {
      const asyncTest = validation({
        test: async (): Promise<boolean> => {
          return new Promise(resolve => {
            resolve(false)
          })
        },
        message: message,
      })
      const testTwoSpy = jest.fn(() => false)
      const testTwo = validation({
        test: testTwoSpy,
        message: message,
        required: true,
      })
      const testObj = {}
      const validators = {
        name: [asyncTest, testTwo],
      }
      const nameError = {
        error: true,
        missing: true,
        field: 'name',
        path: 'name',
        value: null,
        message: "Field:'name' not provided.",
      }
      const expectedResult = {
        valid: false,
        errors: [nameError],
        missing: [nameError],
        struct: {
          name: nameError,
        },
      }

      return validateAsync(validators, testObj).then(validationResult => {
        expect(validationResult).toEqual(
          expect.objectContaining(expectedResult)
        )
        expect(testTwoSpy).not.toBeCalled()
      })
    })
  })
  test('Immediately return rejected promise', async () => {
    const nameValue = 'Sam'
    const testObj = {
      name: nameValue,
    }

    const validator = {
      name: validation({
        test: value => {
          return Promise.resolve(false)
        },
        message: message,
      }),
    }
    const result = await validateAsync(validator, testObj)

    const nameError = {
      error: true,
      missing: false,
      value: nameValue,
      message: message(nameValue, 'name', 'name', testObj),
      field: 'name',
      path: 'name',
    }

    const expectedResult = {
      valid: false,
      errors: [nameError],
      missing: [],
      struct: {
        name: nameError,
      },
    }
    expect(result).toEqual(expect.objectContaining(expectedResult))
  })

  test('Immediately return resolved promise', async () => {
    const nameValue = 'Sam'
    const testObj = {
      name: nameValue,
    }

    const validator = {
      name: validation({
        test: value => {
          return Promise.resolve(true)
        },
        message: message,
      }),
    }
    const result = await validateAsync(validator, testObj)

    const expectedResult = {
      valid: true,
      errors: [],
      missing: [],
      struct: {
        name: {
          error: false,
          missing: false,
          value: nameValue,
          message: '',
          field: 'name',
          path: 'name',
        },
      },
    }
    expect(result).toEqual(expect.objectContaining(expectedResult))
  })
  test('Immediately return promise on a deeply nested field', async () => {
    const nameValue = 'Sam'
    const testObj = {
      d1: {
        d2: {
          name: nameValue,
        },
      },
    }

    const validator = {
      d1: {
        d2: {
          name: validation({
            test: value => {
              return Promise.resolve(true)
            },
          }),
        },
      },
    }
    const result = await validateAsync(validator, testObj)

    const expectedResult = {
      valid: true,
      errors: [],
      missing: [],
      struct: {
        d1: {
          d2: {
            name: {
              error: false,
              missing: false,
              value: nameValue,
              message: '',
              field: 'name',
              path: 'd1.d2.name',
            },
          },
        },
      },
    }
    expect(result).toEqual(expect.objectContaining(expectedResult))
  })
})
