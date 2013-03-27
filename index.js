var ever = require('ever')
var vkey = require('vkey')
var events = require('events')

var game

module.exports = function(gameInstance) {
  // cache the game instance
  game = gameInstance
  return function makeFly(physical, noKeyEvents) {
    return new Fly(physical, noKeyEvents)
  }
}

function Fly(physical, noKeyEvents) {
  this.physical = physical
  if (!noKeyEvents) this.bindKeyEvents()
}

Fly.prototype.bindKeyEvents = function(el) {
  if (!el) el = document.body
  var self = this
  var counter = 0
  var first = Date.now()
  ever(el).on('keydown', onKeyDown)
  
  function onKeyDown(ev) {
    var key = vkey[ev.keyCode] || ev.char
    var binding = game.keybindings[key]
    if (binding !== "jump") return
    if (counter === 1) {
      if (Date.now() - first > 500) {
        return first = Date.now()
      } else {
        if (!self.flying) self.startFlying()
      }
      return counter = 0
    }
    if (counter === 0) {
      first = Date.now()
      counter += 1
    }
  }
}

Fly.prototype.startFlying = function() {
  var self = this
  this.flying = true
  var physical = this.physical
  physical.removeForce(game.gravity)
  physical.onGameTick = function(dt) {
    if (physical.atRestY() === -1) return self.stopFlying()
    physical.friction.x = game.friction
    physical.friction.z = game.friction
    var press = game.controls.state
    if (press['crouch']) return physical.velocity.y = -0.01
    if (press['jump']) return physical.velocity.y = 0.01
    physical.velocity.y = 0
  }
  game.on('tick', physical.onGameTick)
}

Fly.prototype.stopFlying = function() {
  this.flying = false
  var physical = this.physical
  physical.subjectTo(game.gravity)
  game.removeListener('tick', physical.onGameTick)
}