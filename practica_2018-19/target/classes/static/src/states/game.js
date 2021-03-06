Spacewar.gameState = function(game) {
	this.bulletTime
	this.fireBullet
	this.numStars = 100 // Should be canvas size dependant
	this.maxProjectiles = 800 // 8 per player
}

var user_name;
var user_live;
var user_ammo;
var user_fuel;
var pos_nameY = 40
var pos_lifeY = 25
var pos_ammoX = 40
var pos_ammoY = 35
var alinearJugadoresYChat =500
var lengthAnterior = 0

Spacewar.gameState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **GAME** state");
		}
	},

	preload : function() {
		// We create a procedural starfield background
		for (var i = 0; i < this.numStars; i++) {
			let sprite = game.add.sprite(game.world.randomX,
					game.world.randomY, 'spacewar', 'staralpha.png');
			let random = game.rnd.realInRange(0, 0.6);
			sprite.scale.setTo(random, random)
		}

		// We preload the bullets pool
		game.global.proyectiles = new Array(this.maxProjectiles)
		for (var i = 0; i < this.maxProjectiles; i++) {
			game.global.projectiles[i] = {
				image : game.add.sprite(0, 0, 'spacewar', 'projectile.png')
			}
			game.global.projectiles[i].image.anchor.setTo(0.5, 0.5)
			game.global.projectiles[i].image.visible = false
		}

		// we load a random ship
		let random = [ 'blue', 'darkgrey', 'green', 'metalic', 'orange',
				'purple', 'red' ]
		let randomImage = random[Math.floor(Math.random() * random.length)]
				+ '_0' + (Math.floor(Math.random() * 6) + 1) + '.png'
		game.global.myPlayer.image = game.add.sprite(0, 0, 'spacewar',
				game.global.myPlayer.shipType)
		// game.physics.enable(game.global.myPlayer.image,Phaser.Physics.ARCADE);
		game.global.myPlayer.image.anchor.setTo(0.5, 0.5)
		// game.global.myPlayer.image.body.setSize(100,100)
		// game.global.myPlayer.image.body.bounce.x= 0
		// game.global.myPlayer.image.body.bounce.y = 0
		// game.global.myPlayer.image.body.collideWorldBounds = true;

	},

	create : function() {
		this.bulletTime = 0
		this.fireBullet = function() {
			if (game.time.now > this.bulletTime) {
				this.bulletTime = game.time.now + 250;
				// this.weapon.fire()
				return true
			} else {
				return false
			}
		}

		this.wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
		this.sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
		this.aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
		this.dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
		this.rKey = game.input.keyboard.addKey(Phaser.Keyboard.R);
		this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.shiftKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);

		// Stop the following keys from propagating up to the browser
		game.input.keyboard.addKeyCapture([ Phaser.Keyboard.W,
				Phaser.Keyboard.S, Phaser.Keyboard.A, Phaser.Keyboard.D,
				Phaser.Keyboard.SPACEBAR ]);

		// Player name
		var style = {
			font : "15px Arial",
			fill : "#FFFFFF",
			align : "center"
		};
		user_name = game.add.text(game.global.myPlayer.image.x,
				game.global.myPlayer.image.y - pos_nameY,
				game.global.myPlayer.player_name, style)
		user_name.anchor.setTo(0.5, 0.5);

		// Player life
		user_life = game.add.text(game.global.myPlayer.image.x,
				game.global.myPlayer.y - pos_lifeY, "Life: " + game.global.myPlayer.life, 
				{
					font : "15px Arial",
					fill : "#FFFFFF",
					align : "center"
				})
		user_life.anchor.setTo(0.5,0.5)
		
		// Player ammo
		user_ammo = game.add.text(game.global.myPlayer.image.x + pos_ammoX, game.global.myPlayer.y - pos_ammoY, "Ammo: " + game.global.myPlayer.ammo, 
				{
					font:"15px Arial",
					fill:"#FFFFFF",
					align:"center",
				})

		//Player fuel
		user_fuel = game.add.text(game.global.myPlayer.image.x + pos_ammoX, game.global.myPlayer.y + 10,
				"Fuel: "+game.global.myPlayer.fuel+"%",{font:"15px Arial",fill:"#ffffff",align:"center"})
		
		game.camera.follow(game.global.myPlayer.image);

		// Chat
		
		var style = { font: "14px Arial", fill: "#ffff00", align: "center" };

	    this.mensaje1 = game.add.text(game.world.centerX-alinearJugadoresYChat, 470, game.global.mensajeChat, style);
	    
	    this.mensaje2 = game.add.text(game.world.centerX-alinearJugadoresYChat, 450, "", style);
	    
	    this.mensaje3 = game.add.text(game.world.centerX-alinearJugadoresYChat, 430, "", style);
	    
	    var chatTitulo = game.add.text(game.world.centerX-alinearJugadoresYChat, 410, "Chat:", style);
	    
	    var jugadoresTitulo = game.add.text(game.world.centerX-alinearJugadoresYChat, 20, "Jugadores:", style);
	    
		
		botonChat= game.add.button(game.world.centerX-alinearJugadoresYChat,
			centerBotonsY+200, 'send_message', chatFunc, this, 2, 1, 0);
		botonChat.scale.setTo(0.25, 0.25)

		function chatFunc() {
			var input_message = window.prompt("Enter a chat message")
			
			if (input_message === null){
				return
			}
			
			while (input_message ===''){
				input_message = window.prompt("Enter a chat message")
				
			}
			let chatRoom = {
				event : 'CHAT ROOM',
				player: game.global.myPlayer.player_name,
				mensaje: input_message,
				room: game.global.myPlayer.room
			}
			game.global.socket.send(JSON.stringify(chatRoom))
		}
	},

	update : function() {

		// Update player name
		user_name.x = game.global.myPlayer.image.x;
		user_name.y = game.global.myPlayer.image.y - pos_nameY;

		// Update player vida
		user_life.setText("Life: " + game.global.myPlayer.life);
		user_life.x = game.global.myPlayer.image.x;
		user_life.y = game.global.myPlayer.image.y - pos_lifeY;
		
		// Update player ammo
		user_ammo.setText("Ammo: "+ game.global.myPlayer.ammo);
		user_ammo.x = game.global.myPlayer.image.x + pos_ammoX;
		user_ammo.y = game.global.myPlayer.image.y - pos_ammoY;
		
		//Update player fuel
		user_fuel.setText("Fuel: "+game.global.myPlayer.fuel+"%")
		user_fuel.x = game.global.myPlayer.image.x + pos_ammoX;
		user_fuel.y = game.global.myPlayer.image.y + 10;
		
		// Update mensaje de chat
		
			this.mensaje1.setText(game.global.mensajeChat);
			this.mensaje2.setText(game.global.mensajeChat2);
			this.mensaje3.setText(game.global.mensajeChat3);
		
		
		// Update lista de jugadores
		if(game.global.allPlayers.length!==lengthAnterior){
			var nombresEnPantalla=new Array();
		    
			var i = 50;
		    var j = 0;
			for(var jugador of game.global.allPlayers){
				nombresEnPantalla[j]=game.add.text(game.world.centerX-alinearJugadoresYChat, i, jugador.player_name, {font: "14px Arial", fill: "#ffff00", align: "center"})
				i+=30;
				j+=1;
			}
		}
		lengthAnterior=game.global.allPlayers.length

		let msg = new Object()
		msg.event = 'UPDATE MOVEMENT'
		msg.room=game.global.myPlayer.room;
		msg.movement = {
			thrust : false,
			brake : false,
			rotLeft : false,
			rotRight : false,
			fast: false
		}

		msg.bullet = false
		msg.recharge = false

		if (this.wKey.isDown)
			msg.movement.thrust = true;
		if (this.sKey.isDown)
			msg.movement.brake = true;
		if (this.aKey.isDown)
			msg.movement.rotLeft = true;
		if (this.dKey.isDown)
			msg.movement.rotRight = true;
		if(this.shiftKey.isDown){
			msg.movement.fast = true;
		}
		if (this.spaceKey.isDown) {
			if(game.global.myPlayer.ammo > 0){
				msg.bullet = this.fireBullet()
			}
		}
		if(this.rKey.isDown){
			msg.recharge = true
		}
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Sending UPDATE MOVEMENT message to server")
		}
		game.global.socket.send(JSON.stringify(msg))
	}
}