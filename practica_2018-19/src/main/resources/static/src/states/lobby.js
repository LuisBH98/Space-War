Spacewar.lobbyState = function(game) {

}

var distance = 300
var speed = 6
var star;
var texture;

var max = 400;
var xx = []
var yy = []
var zz = []

// Botones alineados:
var centerBotonsY = 300;
var centerBotonsX = 50;
var centerTextY = 315;
var centerTextX = 50;

var input;

Spacewar.lobbyState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **LOBBY** state");
		}
		this.ready = false;
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
		
		
		
		game.add.sprite(0, 0, 'back')

		var title = game.add.sprite(game.world.centerX, 50, 'title')
		title.anchor.setTo(0.5, 0.5)
		title.scale.setTo(1, 1)

		star = game.make.sprite(0, 0, 'star')
		texture = game.add.renderTexture(1024, 600, 'texture')

		game.add.sprite(0, 0, texture)

		for (var i = 0; i < max; i++) {
			xx[i] = Math.floor(Math.random() * 1024) - 400;
			yy[i] = Math.floor(Math.random() * 600) - 300;
			zz[i] = Math.floor(Math.random() * 1700) - 100;
		}

		botonJoin = game.add.button(game.world.centerX - centerBotonsX,
				centerBotonsY, 'boton', joinFunc, this, 2, 1, 0);
		botonJoin.scale.setTo(0.070, 0.070)

		botonJoinNew = game.add.button(game.world.centerX - centerBotonsX,
				centerBotonsY + 100, 'boton', joinFuncNew, this, 2, 1, 0);
		botonJoinNew.scale.setTo(0.070, 0.070)

		botonJoinAny = game.add.button(game.world.centerX - centerBotonsX,
				centerBotonsY + 200, 'boton', joinFuncAny, this, 2, 1, 0);
		botonJoinAny.scale.setTo(0.070, 0.070)

		var createRoom = game.add.text(game.world.centerX + 40, centerTextY,
				"Create room", {
					font : "20px Arial",
					fill : "#ffffff",
					align : "center"
				})
		createRoom.anchor.setTo(0.5, 0.5)

		var joinRoom = game.add.text(game.world.centerX + 65,
				centerTextY + 100, "Join specific room", {
					font : "20px Arial",
					fill : "#ffffff",
					align : "center"
				})
		joinRoom.anchor.setTo(0.5, 0.5)

		var joinRoomAny = game.add.text(game.world.centerX + 48,
				centerTextY + 200, "Join any room", {
					font : "20px Arial",
					fill : "#ffffff",
					align : "center"
				})
		joinRoomAny.anchor.setTo(0.5, 0.5)

		function joinFunc() {
			var input = window.prompt("Enter room name")
			
			while (input==='' || input=== null){
				input = window.prompt("Enter room name")
				
			}
			console.log("Room name:" + input)
			
			let message = {
				event : 'CREATE NEW ROOM',
				room : input
			}
			game.global.socket.send(JSON.stringify(message))
			this.ready = true;
		}

		function joinFuncNew() {
			var input = window.prompt("Enter room name")
			
			while (input==='' || input=== null){
				input = window.prompt("Enter room name")
				
			}
			console.log("Room name:" + input)
			
			let message = {
				event : 'JOIN SPECIFIC ROOM',
				room : input
			}
			
			game.global.socket.send(JSON.stringify(message))
			this.ready = true;
		}

		function joinFuncAny() {
			let message = {
				event : 'JOIN ANY ROOM'
			}
			game.global.socket.send(JSON.stringify(message))
			this.ready = true;
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

		if (this.ready) {
			game.state.start('matchmakingState')
		}
	}
}