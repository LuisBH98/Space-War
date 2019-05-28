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
			let join = {
				event : 'JOIN'
			}
			game.global.socket.send(JSON.stringify(join))
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

		botonCreateRoom = game.add.button(game.world.centerX,
				centerBotonsY, 'create_room', createRoom, this, 2, 1, 0);
		botonCreateRoom.scale.setTo(0.25, 0.25)
		botonCreateRoom.anchor.setTo(0.5,0.5)
		
		botonSpecificRoom = game.add.button(game.world.centerX,
				centerBotonsY + 100, 'joinSpecific', joinSpecificRoom, this, 2, 1, 0);
		botonSpecificRoom.scale.setTo(0.25, 0.25)
		botonSpecificRoom.anchor.setTo(0.5,0.5)

		botonAnyRoom = game.add.button(game.world.centerX,
				centerBotonsY + 200, 'joinRoom', joinAnyRoom, this, 2, 1, 0);
		botonAnyRoom.scale.setTo(0.25, 0.25)
		botonAnyRoom.anchor.setTo(0.5,0.5)

		function createRoom() {
			var roomName = window.prompt("Enter room name")
			
			if (roomName === null){
				return
			}
			
			while (roomName===''){
				roomName = window.prompt("Enter room name")
				
			}
			console.log("Room name:" + roomName)
			
			let createRoom = {
				event : 'CREATE NEW ROOM',
				room : roomName
			}
			game.global.socket.send(JSON.stringify(createRoom))
			this.ready = true;
		}

		function joinSpecificRoom() {
			var roomName = window.prompt("Enter room name")
			
			if (roomName == null){
				return
			}
			while (roomName===''){
				roomName = window.prompt("Enter room name")
				
			}
			console.log("Room name:" + roomName)
			
			let enterSpecificRoom = {
				event : 'JOIN SPECIFIC ROOM',
				room : roomName
			}
			
			game.global.socket.send(JSON.stringify(enterSpecificRoom))
			this.ready = true;
		}

		function joinAnyRoom() {
			let enterAnyRoom = {
				event : 'JOIN ANY ROOM'
			}
			game.global.socket.send(JSON.stringify(enterAnyRoom))
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