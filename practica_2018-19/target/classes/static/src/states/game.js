Spacewar.gameState = function(game) {
	this.bulletTime
	this.fireBullet
	this.numStars = 100 // Should be canvas size dependant
	this.maxProjectiles = 800 // 8 per player
}

var user_name;
var user_live;
var x, y;

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
		this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

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
				game.global.myPlayer.image.y - 40,
				game.global.myPlayer.player_name, style)
		user_name.anchor.setTo(0.5, 0.5);

		user_life = game.add.text(game.global.myPlayer.image.x,
				game.global.myPlayer.y - 35, "Life: " + game.global.myPlayer.life, 
				{
					font : "15px Arial",
					fill : "#FFFFFF",
					align : "center"
				})

		game.camera.follow(game.global.myPlayer.image);
	},

	update : function() {

		// Update player name
		user_name.x = game.global.myPlayer.image.x;
		user_name.y = game.global.myPlayer.image.y - 40;

		// Update player vida
		user_life.x = game.global.myPlayer.image.x;
		user_life.y = game.global.myPlayer.image.y - 30;
		// user_live = new
		// Phaser.Rectangle(game.global.myPlayer.image.x-50,game.global.myPlayer.image.y-30,
		// game.global.myPlayer.live,10)
		// game.debug.geom(user_live,'#1BFF00')

		let msg = new Object()
		msg.event = 'UPDATE MOVEMENT'

		msg.movement = {
			thrust : false,
			brake : false,
			rotLeft : false,
			rotRight : false
		}

		msg.bullet = false

		if (this.wKey.isDown)
			msg.movement.thrust = true;
		if (this.sKey.isDown)
			msg.movement.brake = true;
		if (this.aKey.isDown)
			msg.movement.rotLeft = true;
		if (this.dKey.isDown)
			msg.movement.rotRight = true;
		if (this.spaceKey.isDown) {
			msg.bullet = this.fireBullet()
		}

		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Sending UPDATE MOVEMENT message to server")
		}
		game.global.socket.send(JSON.stringify(msg))
	}
}