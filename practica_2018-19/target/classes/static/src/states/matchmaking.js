Spacewar.matchmakingState = function(game) {

}
var distance = 300
var speed = 6
var star;
var texture;

var max = 400;
var xx = []
var yy= []
var zz = []
Spacewar.matchmakingState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **MATCH-MAKING** state");
		}
	},

	preload : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Joining room...");
		}
	},

	create : function() {
		game.add.sprite(0,0,'back')
		var title = game.add.sprite(game.world.centerX,50,'salaEspera')
		title.anchor.setTo(0.5,0.5)
		title.scale.setTo(1,1)
		
		star = game.make.sprite(0,0,'star')
		texture = game.add.renderTexture(1024,600,'texture')
		
		game.add.sprite(0,0,texture)
		
		for(var i = 0; i<max; i++){
			xx[i] = Math.floor(Math.random()*1024)-400;
			yy[i] = Math.floor(Math.random()*600)-300;
			zz[i] = Math.floor(Math.random()*1700)-100;
		}
	},

	update : function() {
texture.clear();
		
		for(var i = 0; i < max; i++){
			var perspective = distance / (distance -zz[i]);
			var x = game.world.centerX + xx[i] * perspective;
			var y = game.world.centerY + yy[i] * perspective;
			
			zz[i] += speed;
			
			if(zz[i]>300){
				zz[i]-=600
			}
			
			texture.renderXY(star,x,y);
		}
		
		if (typeof game.global.myPlayer.room !== 'undefined') {
			if (game.global.DEBUG_MODE) {
				console.log("[DEBUG] Joined room " + game.global.myPlayer.room);
			}
			let message = {
					event: 'PLAYERS',
					room: game.global.myPlayer.room
			}
			game.global.socket.send(JSON.stringify(message));
			if(game.global.enough_players){
				game.state.start('roomState')
			}
		}
	}
}