Spacewar.puntuationState = function(game) {

}

Spacewar.puntuationState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **PUNTUATION** state");
		}
	},

	preload : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Joining room...");
		}
	},

	create : function() {
		let message = {
				event: 'REMOVE ROOM',
				room:game.global.myPlayer.room
		}
		game.global.socket.send(JSON.stringify(message));
		
        console.log(game.global.myPlayer.player_name)
        console.log(game.global.myPlayer.perdedor)
        console.log(game.global.myPlayer.life)
        console.log(game.global.myPlayer.puntuacion)
	},

	update : function() {
	}
}