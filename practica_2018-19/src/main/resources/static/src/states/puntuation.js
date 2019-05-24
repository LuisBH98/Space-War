Spacewar.puntuationState = function(game) {

}
var puntuacion1 = null
var puntuacion2 = null
var posY = 30

Spacewar.puntuationState.prototype = {

	

	init : function() {
		

		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **PUNTUATION** state");
		}
		let message = {
			event : 'REMOVE ROOM',
			room : game.global.myPlayer.room
		}
		game.global.socket.send(JSON.stringify(message));
		console.log(game.global.myPlayer.player_name)
		console.log(game.global.myPlayer.perdedor)
		console.log(game.global.myPlayer.life)
		console.log(game.global.myPlayer.puntuacion)
	},

	preload : function() {
		game.load.script('webfont',
				'//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js')

		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Joining room...");
		}
	},

	create : function() {
		game.add.sprite(0, 0, 'back')

		var back_button = game.add.button(game.world.centerX, 550,
				'back_button', backToMenu, this, 2, 1, 0);
		back_button.scale.setTo(0.125, 0.125)
		back_button.anchor.setTo(0.5, 0.5)

		var title = game.add.sprite(game.world.centerX, 50, 'puntuation')
		title.anchor.setTo(0.5, 0.5)
		title.scale.setTo(1, 1)

		setTimeout(()=>{
			puntuacion1 = game.add.text(game.world.centerX, game.world.centerY-150,
					game.global.myPlayer.player_name+" .............................. " + game.global.myPlayer.puntuacion)
			puntuacion1.font = "Orbitron"
			puntuacion1.fontSize = '30px'
			puntuacion1.fill = "#FFDC00"
			puntuacion1.anchor.set(0.5)
			puntuacion1.align = 'center'
				
			setTimeout(()=>{
				puntuacion2 = game.add.text(game.world.centerX, game.world.centerY-120 + posY, game.global.otherPlayers[1].player_name._text+" ..............................  "+game.global.otherPlayers[1].puntuacion)
				puntuacion2.font = "Orbitron"
				puntuacion2.fontSize = '30px'
				puntuacion2.fill = "#FFDC00"
				puntuacion2.anchor.set(0.5)
				puntuacion2.align = 'center'
			},2000);
			
		},2000);
		
		
		
		star = game.make.sprite(0, 0, 'star')
		texture = game.add.renderTexture(1024, 600, 'texture')

		game.add.sprite(0, 0, texture)

		for (var i = 0; i < max; i++) {
			xx[i] = Math.floor(Math.random() * 1024) - 400;
			yy[i] = Math.floor(Math.random() * 600) - 300;
			zz[i] = Math.floor(Math.random() * 1700) - 100;
		}

		function backToMenu() {
			game.global.myPlayer = new Object();
			game.global.otherPlayers = [];
			game.state.start('lobbyState')
		}
	},

	update : function() {
		texture.clear();

		for (var i = 0; i < max; i++) {
			var perspective = distance / (distance - zz[i]);
			var x = game.world.centerX + xx[i] * perspective;
			var y = game.world.centerY + yy[i] * perspective;

			zz[i] += speed;

			if (zz[i] > 300) {
				zz[i] -= 600
			}

			texture.renderXY(star, x, y);
		}
	}
}