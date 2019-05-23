Spacewar.matchmakingState = function(game) {

}

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
		let message = {
			event : 'PLAYERS',
			room: game.global.myPlayer.room
		}
		game.global.socket.send(JSON.stringify(message))
	},

	create : function() {

	},

	update : function() {
		if (typeof game.global.myPlayer.room !== 'undefined') {
			if (game.global.DEBUG_MODE) {
				console.log("[DEBUG] Joined room " + game.global.myPlayer.room);
			}
			let message = {
					event: 'PLAYERS',
					room:game.global.myPlayer.room
			}
			game.global.socket.send(JSON.stringify(message));
			if(game.global.enough_players){
				game.state.start('roomState')
			}
		}
	}
}