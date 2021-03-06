'use strict'

const Emitter = require('../emitter')
const id = require('../id-gen')
const parser = require('./parser')
const Widget = require('../widget')
const PluginLoader = require('../plugin/loader')
const bundler = require('./bundler')
const compiler = require('./compiler')

class Dashboard {
  constructor (json, io) {
    const descriptor = parser.parse(json)

    this.id = id()
    this.name = descriptor.name
    this.emitter = new Emitter(io, this.id)
    this.layout = descriptor.layout

    this.datasources = {}

    const pluginIds = descriptor.plugins && Object.keys(descriptor.plugins)
    if (pluginIds) {
      pluginIds.forEach((id) => {
        const pluginConfig = descriptor.plugins[id]
        const pluginLoader = new PluginLoader(id, this)
        pluginLoader.load(pluginConfig)
      })
    }

    this.widgets = descriptor.widgets.map(({ position, background, datasource, widget, options }) => {
      return new Widget(this, {
        position: position,
        background: background,
        datasource: datasource
      }, widget, options)
    })
  }

  initialise () {
    this.buildJobs()
  }

  getWidgets () {
    return this.widgets
  }

  getJobs () {
    return this.jobs
  }

  buildJobs () {
    this.jobs = this.getWidgets().map((widget) => {
      const job = widget.getJob()
      if (job) {
        let executeJob = this.emitResult.bind(this, widget, this.emitter)
        executeJob()
        return setInterval(executeJob, job.schedule)
      }
    })
  }

  emitResult (widget, emitter) {
    return widget.getJob().script().then((result) => {
      result._updated = new Date()
      emitter.emit(`${widget.id}:update`, result)
      emitter = null
    })
    .catch((err) => {
      console.error(`Error in widget ${widget.descriptor} (${widget.id})`, err)
      emitter.emit(widget.id, { error: { message: (err && err.message) || 'An unknown error occured' } })
      emitter = null
    })
  }

  toRenderModel () {
    const model = {
      name: this.name,
      widgets: this.getWidgets().map((widget) => {
        return widget.toRenderModel()
      })
    }

    const bundle = bundler.build(model.widgets)

    return compiler.compile(bundle.js)
    .then(({ js, css }) => {
      const allCss = `${css}\n${bundle.css}`
      return { html: bundle.html, js, css: allCss, name: model.name }
    })
  }
}

module.exports = Dashboard
