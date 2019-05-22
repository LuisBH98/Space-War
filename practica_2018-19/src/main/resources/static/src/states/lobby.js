Spacewar.lobbyState = function(game) {

}

var distance = 300
var speed = 6
var star;
var texture;

var max = 400;
var xx = []
var yy= []
var zz = []

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
		
		game.add.sprite(0,0,'back')
		
		var title = game.add.sprite(game.world.centerX,50,'title')
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
		
		botonJoin = game.add.button(game.world.centerX - 50, 300, 'boton', joinFunc, this, 2, 1, 0);
		botonJoin.scale.setTo(0.070, 0.070)
		
		botonJoinNew = game.add.button(game.world.centerX - 50, 400, 'boton', joinFuncNew, this, 2, 1, 0);
		botonJoinNew.scale.setTo(0.070, 0.070)
		
		var createRoom = game.add.text(game.world.centerX + 40, 315, "Create room",{font:"20px Arial",fill:"#ffffff",align:"center"})
		createRoom.anchor.setTo(0.5,0.5)
		
		var joinRoom = game.add.text(game.world.centerX + 30, 415, "Join room",{font:"20px Arial",fill:"#ffffff",align:"center"})
		joinRoom.anchor.setTo(0.5,0.5)
		
		function joinFunc(){
			let message = {
					event : 'ROOM1',
					room: 'Room1'
				}
				game.global.socket.send(JSON.stringify(message))
				this.ready=true;
		}
		
		function joinFuncNew(){
			let message = {
					event : 'ROOM2',
					room:'Room2'
				}
				game.global.socket.send(JSON.stringify(message))
				this.ready=true;
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
		

		if(this.ready){
			game.state.start('matchmakingState')
		}
	}
}