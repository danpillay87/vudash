'use strict'

window.VUDASH = window.VUDASH || {}
var VUDASH = window.VUDASH

var Player = function () {
  this.playing = false
}

Player.prototype.isPlaying = function () {
  return this.playing
}

Player.prototype.play = function (data, start, end) {
  var self = this
  var snd = new Audio(data)
  snd.addEventListener('playing', function () {
    self.playing = true
    start && start()
  })
  snd.addEventListener('ended', function () {
    self.playing = false
    end && end()
  })
  snd.play()
}

VUDASH.player = new Player()
