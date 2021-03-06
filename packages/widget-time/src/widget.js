'use strict'

const moment = require('moment-timezone')
const Joi = require('joi')
const Hoek = require('hoek')
const { CronJob } = require('cron')
const { time } = require('./time')

class TimeWidget {

  parseOptions (options) {
    const action = Joi.object({
      action: Joi.string().only('sound').description('Action name'),
      options: Joi.object({
        data: Joi.string().description('Data uri for sound file')
      }).description('Action configuration')
    }).description('Action')

    const alarm = Joi.object({
      expression: Joi.string().description('Cron Expression'),
      actions: Joi.array().items(action).description('Actions')
    }).required().description('Alarm entry')

    const schema = Joi.object({
      timezone: Joi.string().only(moment.tz.names()).optional().description('A momentjs timezone'),
      alarms: Joi.array().items(alarm).optional().description('List of alarms')
    }).optional()

    return Joi.validate(options, schema)
  }

  register (options, emit) {
    const { error, value: config } = this.parseOptions(options)
    if (error) { throw new Error(error) }

    const alarms = Hoek.reach(config, 'alarms', { default: [] })
    const timezone = config.timezone || 'UTC'

    alarms.forEach((alarm) => {
      alarm.actions.forEach((action) => {
        const context = { options: action.options, emit }

        return new CronJob({
          cronTime: alarm.expression,
          onTick: function () {
            this.emit('audio:play', { data: this.options.data })
          },
          context,
          start: true,
          timeZone: timezone
        })
      })
    })

    return {
      schedule: 1000,
      job: () => {
        return time(timezone)
      }
    }
  }

}

module.exports = TimeWidget
