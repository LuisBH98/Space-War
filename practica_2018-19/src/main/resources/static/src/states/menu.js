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
		
	},

	create : function() {
		botonJoin = game.add.button(game.world.centerX - 95, 400, 'boton', createRoomFunc, this, 2, 1, 0);
		botonJoin.scale.setTo(0.070, 0.070)
		
		function createRoomFunc(){
			this.ready = true;
		}
	},
	
	update : function() {
		if(this.ready){
			game.state.start('lobbyState')	
		}
	}
}
