Spacewar.puntuationState = function (game) {

}
var puntuacion1 = null
var puntuacion2 = null
var posY = 30

Spacewar.puntuationState.prototype = {



	init: function () {


		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **PUNTUATION** state");
		}
		let removeRoom = {
			event: 'REMOVE ROOM',
			room: game.global.myPlayer.room
		}
		game.global.socket.send(JSON.stringify(removeRoom));
		let resetVariables = {
				event: 'RESET VARIABLES'
		}
		game.global.socket.send(JSON.stringify(resetVariables));
	},

	preload: function () {
		game.load.script('webfont',
			'//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js')

		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Joining room...");
		}
	},

	create: function () {
		game.add.sprite(0, 0, 'back')

		var back_button = game.add.button(game.world.centerX, 550,
			'back_button', backToMenu, this, 2, 1, 0);
		back_button.scale.setTo(0.125, 0.125)
		back_button.anchor.setTo(0.5, 0.5)

		var title = game.add.sprite(game.world.centerX, 50, 'puntuation')
		title.anchor.setTo(0.5, 0.5)
		title.scale.setTo(1, 1)

		var variableDeCentrado = 150;
		
		
		function ordenarJugadores(){
			for(var i=0;i<game.global.allPlayers.length-1;i++){
				var variableOrdenar=game.global.allPlayers[i]
				if(variableOrdenar.puntuacion<game.global.allPlayers[i+1].puntuacion){
					game.global.allPlayers[i]=game.global.allPlayers[i+1]
					game.global.allPlayers[i+1]=variableOrdenar
				}
			}
		}
		ordenarJugadores();
		for (var player of game.global.allPlayers) {
				puntuacion = game.add.text(game.world.centerX, game.world.centerY - variableDeCentrado,
					player.player_name + " .............................. " + player.puntuacion)
				puntuacion.font = "Orbitron"
				puntuacion.fontSize = '30px'
				puntuacion.fill = "#FFDC00"
				puntuacion.anchor.set(0.5)
				puntuacion.align = 'center'
				variableDeCentrado-= 40
		}

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
			game.global.allPlayers=[];
			game.state.start('lobbyState')
		}
	},

	update: function () {
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