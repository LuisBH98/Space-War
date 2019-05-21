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
			this.ready=true;
		text = game.add.text(game.world.centerX - 20, 420, "Play",{font:"30px Arial",fill:"#ffffff",align:"center"})
		text.anchor.set(0.5)
		
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