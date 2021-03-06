'use strict'

const loader = require('.')
const locator = require('./locator')
const DatasourceBuilder = require(fromTest('util/datasource.builder'))
const Joi = require('joi')
const validator = require('./validator')

context('datasource.validator', () => {
  const widget = DatasourceBuilder.create().build()

  context('Datasource specified', () => {
    beforeEach((done) => {
      sinon.stub(locator, 'locate')
      sinon.stub(validator, 'validate').returns({})
      done()
    })

    afterEach((done) => {
      locator.locate.restore()
      validator.validate.restore()
      done()
    })

    it('Registers widget data source', (done) => {
      locator.locate.returns({ Constructor: widget, options: {} })
      loader.load('some-widget', {}, { name: 'a-datasource' })
      expect(locator.locate.callCount).to.equal(1)
      expect(locator.locate.firstCall.args[1]).to.equal('a-datasource')
      done()
    })

    it('calls for widget validation on load', (done) => {
      const options = { foo: 'bar' }
      locator.locate.returns({ Constructor: widget, options: {}, validation: Joi.object().required() })
      loader.load('some-widget', {}, { name: 'a-datasource', options })
      expect(validator.validate.callCount).to.equal(1)
      expect(validator.validate.firstCall.args[2]).to.equal(options)
      done()
    })

    it('no validation specified', (done) => {
      locator.locate.returns({ Constructor: widget, options: {} })
      loader.load('some-widget', {}, { name: 'a-datasource' })
      expect(validator.validate.callCount).to.equal(0)
      done()
    })
  })

  context('no datasource specified', () => {
    it('will polyfill a fetch method which throws', (done) => {
      const loaded = loader.load('some-widget', {}, {})
      function fn () { return loaded.fetch() }
      expect(fn).to.throw('Widget some-widget requested data, but no datasource was configured. Check the widget configuration in your dashboard config.')
      done()
    })
  })
})
