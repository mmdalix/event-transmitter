const request = require("request")
const utils = require('./utils')
const Queue = require('better-queue')

let EventTransmitter = function (project, app_url, username, password) {
    const MAX_CONCURRENT = 8
    const MAX_RETRY_ATTEMPTS = 3

    let queue = new Queue(async (event, cb) => {
        try {
            await sendEvent(event)
            cb()
        } catch (err) {
            cb(err)
        }
    }, {
            concurrent: MAX_CONCURRENT,
            maxRetries: MAX_RETRY_ATTEMPTS
        })

    this.postEvent = (event_name, params, extras, cb) => {

        let event = new Event(event_name, params, extras)

        queue.push(event)
            .once('failed', (err) => {
                event.missed(err)
                cb && cb("missed")

            })
            .once('finish', () => { cb && cb() })
    }

    let sendEvent = (event) => new Promise((resolve, reject) => {
        var request_options = {
            url: app_url + '/api/postEvent',
            auth: {
                user: username,
                password: password
            },
            json: {
                "project": project,
                "event": event.name,
                "params": event.params,
                "extras": event.extras,
                "token": event.token,
                "attempts": event.attempts
            }
        }
        request.post(request_options, (err, res, body) => {
            if (err) {
                reject(err)
                return
            }
            if (res.statusCode == 200 && body.status == true) {
                resolve()
            } else {
                reject(body)
            }
        })
    })
    class Event {
        constructor(name, params, extras) {
            this.name = name
            this.params = params || []
            this.extras = extras || []
            this.token = utils.randomString(16)
            this.attempts = 0
        }
        missed(err) {

            console.error("Event missed")
            console.error(err)
            console.error(this)
        }
    }
}
module.exports = (project, app_url, username, password) => new EventTransmitter(project, app_url, username, password)