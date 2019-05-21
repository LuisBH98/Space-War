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

	},

	create : function() {
		
		botonJoin = game.add.button(game.world.centerX - 95, 400, 'boton', joinFunc, this, 2, 1, 0);
		botonJoin.scale.setTo(0.070, 0.070)
		
		botonJoinNew = game.add.button(game.world.centerX, 400, 'boton', joinFuncNew, this, 2, 1, 0);
		botonJoinNew.scale.setTo(0.070, 0.070)
		
		function joinFunc(){
			let message = {
					event : 'JOIN ANY ROOM',
					room: 'Room1'
				}
				game.global.socket.send(JSON.stringify(message))
				this.ready=true;
		}
		
		function joinFuncNew(){
			let message = {
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
		
	}
}