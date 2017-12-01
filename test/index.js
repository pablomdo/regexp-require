'use strict'

const proxy = require('proxyquire')
const mock = require('mock-require')
const expect = require('chai').expect

const mocks = {
  npm: {
    load: (options, callback) => {
      this.options = options
      callback()
    },
    commands: {
      ls: (some, stuff, callback) => {
        let data

        if (this.options.global) {
          data = {
            dependencies: {
              'grunt': {},
              'gulp': {},
              'nodemon': {},
              'npm': {}
            }
          }
        } else {
          data = {
            dependencies: {
              'express': {},
              'express-session': {},
              'mongoose': {},
              'npm': {}
            },
            devDependencies: {
              'gulp': {},
              'gulp-mocha': {},
              'mocha': {}
            }
          }
        }

        callback(undefined, data)
      }
    }
  },
  requireg: () => {
    return {}
  }
}

const rrequire = proxy('../index.js', mocks)

function mockModules(modules) {
  modules.forEach((module) => {
    mock(module, {})
  })
}

describe('regexp-module-loader', () => {
  it('should load global modules by default', () => {
    const expected = ['grunt', 'gulp']
    const actual = rrequire(/^g/)

    expected.forEach((moduleName) => {
      expect(actual).to.have.property(moduleName)
    })
  })

  it('should load local modules', () => {
    const expected = ['express', 'express-session']
    mockModules(expected)
    const actual = rrequire(/^express/)

    expected.forEach((module) => {
      expect(actual).to.have.property(module)
    })
  })

  it('should load local devDependencies', () => {
    const expected = ['mocha', 'gulp-mocha']
    mockModules(expected)
    const options = {
      ignoreDev: false
    }

    const actual = rrequire(/mocha/, options)
    expected.forEach((module) => {
      expect(actual).to.have.property(module)
    })
  })

  it('should return a promise when isAsync=true', (done) => {
    const expected = ['grunt', 'gulp']
    const options = {
      isAsync: true
    }

    rrequire(/^g/, options)
      .then((actual) => {
        expected.forEach((module) => {
          expect(actual).to.have.property(module)
        })

        done()
      })
  })

  it('should return an empty array if no matches were found', () => {
    const actual = rrequire(/^hapi/)
    expect(actual).to.be.empty
  })
})
