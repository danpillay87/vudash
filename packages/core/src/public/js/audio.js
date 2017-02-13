'use strict'

window.VUDASH = window.VUDASH || {}
var VUDASH = window.VUDASH

var Player = function () {
  this.isPlaying = false
}

Player.prototype.isPlaying = function () {
  return this.isPlaying
}

Player.prototype.play = function (data) {
  const self = this
  var snd = new Audio(data)
  snd.addEventListener('playing', function () {
    console.log('PLAYING AUDIO')
    self.isPlaying = true
  }, true)
  snd.addEventListener('ended', function () {
        console.log('STOPPED PLAYING AUDIO')
    self.isPlaying = false
  }, true)
  snd.play()
}

VUDASH.player = new Player()
