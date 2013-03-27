var game = require('voxel-hello-world')()
var fly = require('./')
var makeFly = fly(game)
makeFly(game.controls.target())
window.game = game
