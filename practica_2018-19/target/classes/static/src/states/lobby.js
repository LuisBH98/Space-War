Spacewar.lobbyState = function(game) {

}

Spacewar.lobbyState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **LOBBY** state");
		}
		this.ready=false;
	},

	preload : function() {
		// In case JOIN message from server failed, we force it
		if (typeof game.global.myPlayer.id == 'undefined') {
			if (game.global.DEBUG_MODE) {
				console.log("[DEBUG] Forcing joining server...");
			}
			let message = {
				event : 'JOIN'
			}
			game.global.socket.send(JSON.stringify(message))
		}
	},

	create : function() {
		botonJoin = game.add.button(game.world.centerX - 95, 400, 'boton', joinFunc, this, 2, 1, 0);
		botonJoin.scale.setTo(0.070, 0.070)
		
		botonJoinNew = game.add.button(game.world.centerX - 45, 400, 'boton', joinFuncNew, this, 2, 1, 0);
		
		botonJoin = game.add.button(game.world.centerX - 95, 400, 'boton', joinFunc, this, 2, 1, 0);
		botonJoin.scale.setTo(0.070, 0.070)
		
		botonJoinNew = game.add.button(game.world.centerX, 400, 'boton', joinFuncNew, this, 2, 1, 0);
		botonJoinNew.scale.setTo(0.070, 0.070)
		
		function joinFunc(){
			let message = {
					event : 'ROOM1',
					event : 'JOIN ANY ROOM',
					room: 'Room1'
				}
				game.global.socket.send(JSON.stringify(message))
				this.ready=true;
		}
		
		function joinFuncNew(){
			let message = {
					event : 'ROOM2',
					event : 'JOIN SPECIFIC ROOM',
					room:'Room2'
				}
				game.global.socket.send(JSON.stringify(message))
				this.ready=true;
		}
		
	},

	update : function() {

		if(this.ready){
			game.state.start('matchmakingState')
		}
		if(this.ready){
			game.state.start('matchmakingState')
		}
		
	}
}