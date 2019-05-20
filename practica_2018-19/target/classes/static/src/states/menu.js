Spacewar.menuState = function(game) {

}

Spacewar.menuState.prototype = {
	

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **MENU** state");
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
		botonJoinNew.scale.setTo(0.070, 0.070)
		
		function joinFunc(){
			let message = {
					event : 'JOIN ANY ROOM'
				}
				game.global.socket.send(JSON.stringify(message))
				this.ready=true;
		}
		
		function joinFuncNew(){
			let message = {
					event : 'JOIN SPECIFIC ROOM'
				}
				game.global.socket.send(JSON.stringify(message))
				this.ready=true;
		}
	},
	
	update : function() {
		if(this.ready){
			game.state.start('roomState')	
		}
	}
}