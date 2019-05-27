window.onload = function() {

	game = new Phaser.Game(1024, 600, Phaser.AUTO, 'gameDiv')

	// GLOBAL VARIABLES
	game.global = {
		mensajeChat : "Sin hablar",
		mensajeChat2: "",
		primerMensaje : false,
		mensajeChat3: "",
		segundoMensaje : false,
		FPS : 30,
		DEBUG_MODE : false,
		socket : null,
		myPlayer : new Object(),
		allPlayers: [],
		otherPlayers : [],
		projectiles : [],
		enough_players: false
	}

	var pos_nameY = 40
	var pos_lifeY = 25
	var pos_ammoX = 40
	var pos_ammoY = 35
	// WEBSOCKET CONFIGURATOR
	game.global.socket = new WebSocket("ws://127.0.0.1:8080/spacewar")
	
	game.global.socket.onopen = () => {
		if (game.global.DEBUG_MODE) {
			console.log('[DEBUG] WebSocket connection opened.')
		}
	}

	game.global.socket.onclose = () => {
		if (game.global.DEBUG_MODE) {
			console.log('[DEBUG] WebSocket connection closed.')
		}
	}
	
	game.global.socket.onmessage = (message) => {
		var msg = JSON.parse(message.data)
		
		switch (msg.event) {
		case 'JOIN':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] JOIN message recieved')
				console.dir(msg)
				console.log(msg)
			}
			game.global.myPlayer.id = msg.id
			game.global.myPlayer.shipType = msg.shipType
			game.global.myPlayer.player_name = msg.player_name;
			game.global.myPlayer.life = msg.life;
			game.global.myPlayer.ammo = msg.ammo;
			game.global.myPlayer.fuel = msg.fuel;
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] ID assigned to player: ' + game.global.myPlayer.id)
				console.log('[DEBUG] Name assigned to player: ' + game.global.myPlayer.player_name);
				console.log('[DEBUG] Player life set to: ' + game.global.myPlayer.life);
			}
			break
		case 'NEED TO CREATE ROOMS' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] THE ROOM NAME is not valid')
				console.dir(msg)
			}
			console.log("La room con nombre "+msg.room+" no existe, necesitas crearla!!");
			game.state.start('lobbyState')
			break
		case 'ANOTHER ROOM NAME' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] THE ROOM NAME is not valid')
				console.dir(msg)
			}
			console.log("The room name "+ msg.room +" is already used. Write another name.");
			game.state.start('lobbyState')
			break
		case 'JOIN ROOM' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] JOIN ROOM message recieved')
				console.dir(msg)
			}
			game.global.myPlayer.room = msg.room;
			break
		case 'ROOMS OCCUPIED' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] THE ROOM is already occupied')
				console.dir(msg)
			}
			if(!msg.room){
				console.log("Todas las rooms que existen están ocupadas. Puedes crear tu propia room.");
			}else{
				console.log("La room "+msg.room+" está llena prueba en otro momento o crea tu propia room.");
			}
			game.state.start('lobbyState')
			break
		case 'NUM_PLAYERS':
			if(msg.players == 2){
				game.global.enough_players = true;
			}
			break;
		case 'GAME STATE UPDATE' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] GAME STATE UPDATE message recieved')
				console.dir(msg)
			}
			if (typeof game.global.myPlayer.image !== 'undefined') {
				game.global.allPlayers=msg.players;
				if (msg.players.length==1){
					console.log("Ganaste")
					game.state.start('puntuationState')
				}
				for (var player of msg.players) {
					if (game.global.myPlayer.id == player.id) {
						game.global.myPlayer.id = player.id;
						game.global.myPlayer.image.x = player.posX;
						game.global.myPlayer.image.y = player.posY;
						game.global.myPlayer.image.angle = player.facingAngle;
						game.global.myPlayer.player_name = player.player_name;
						game.global.myPlayer.life = player.life;
						game.global.myPlayer.ammo = player.ammo;
						game.global.myPlayer.perdedor = player.perdedor;
						game.global.myPlayer.ganador = player.ganador;
						game.global.myPlayer.puntuacion = player.puntuacion;
						game.global.myPlayer.fuel = player.fuel;
						if(game.global.myPlayer.puntuacion==msg.puntuacionMaxima){
							console.log("Ganaste")
							game.state.start('puntuationState')
						}
					} else {
						if (typeof game.global.otherPlayers[player.id] == 'undefined') {
							game.global.otherPlayers[player.id] = {
									image : game.add.sprite(player.posX, player.posY, 'spacewar', player.shipType)
							}
							game.global.otherPlayers[player.id].player_name = game.add.text(player.posX,player.posY-pos_nameY,player.player_name,{font:"15px Arial",fill:"#ffffff"})
							game.global.otherPlayers[player.id].player_name.anchor.setTo(0.5,0.5)
							game.global.otherPlayers[player.id].life = game.add.text(player.posX,player.posY-pos_lifeY,"Life: " + player.life,{font:"15px Arial",fill:"#ffffff"})
							game.global.otherPlayers[player.id].life.anchor.setTo(0.5,0.5)
							game.global.otherPlayers[player.id].image.anchor.setTo(0.5, 0.5)
							game.global.otherPlayers[player.id].ammo = game.add.text(player.posX+pos_ammoX,player.posY-pos_ammoY,"Ammo:" + player.ammo,{font:"15px Arial",fill:"#ffffff"})
							game.global.otherPlayers[player.id].perdedor = player.perdedor;
							game.global.otherPlayers[player.id].puntuacion = player.puntuacion;
							game.global.otherPlayers[player.id].id = player.id;
							game.global.otherPlayers[player.id].fuel = game.add.text(player.posX+pos_ammoX,player.posY+10,"Fuel: " + player.fuel+"%",{font:"15px Arial",fill:"#ffffff"})
							
							if(game.global.otherPlayers[player.id].puntuacion==msg.puntuacionMaxima){
								console.log("Perdiste")
								game.state.start('puntuationState')
							}
						} else {
							game.global.otherPlayers[player.id].image.x = player.posX;
							game.global.otherPlayers[player.id].image.y = player.posY;
							game.global.otherPlayers[player.id].image.angle = player.facingAngle;
							game.global.otherPlayers[player.id].player_name.x = player.posX;
							game.global.otherPlayers[player.id].player_name.y = player.posY-pos_nameY;
							game.global.otherPlayers[player.id].life.setText("Life: " + player.life);
							game.global.otherPlayers[player.id].life.x = game.global.otherPlayers[player.id].image.x;
							game.global.otherPlayers[player.id].life.y = game.global.otherPlayers[player.id].image.y-pos_lifeY;
							game.global.otherPlayers[player.id].ammo.x = game.global.otherPlayers[player.id].image.x+pos_ammoX;
							game.global.otherPlayers[player.id].ammo.y = game.global.otherPlayers[player.id].image.y-pos_ammoY;
							game.global.otherPlayers[player.id].ammo.setText("Ammo: " + player.ammo);
							game.global.otherPlayers[player.id].perdedor = player.perdedor;
							game.global.otherPlayers[player.id].puntuacion = player.puntuacion;
							game.global.otherPlayers[player.id].id = player.id;
							game.global.otherPlayers[player.id].fuel.x = game.global.otherPlayers[player.id].image.x+pos_ammoX;
							game.global.otherPlayers[player.id].fuel.y = game.global.otherPlayers[player.id].image.y + 10;
							game.global.otherPlayers[player.id].fuel.setText("Fuel: " + player.fuel+"%")
							if(game.global.otherPlayers[player.id].puntuacion==msg.puntuacionMaxima){
								console.log("Perdiste")
								game.state.start('puntuationState')
							}
						}
					}
				}
				
				for (var projectile of msg.projectiles) {
					if (projectile.isAlive) {
						game.global.projectiles[projectile.id].image.x = projectile.posX
						game.global.projectiles[projectile.id].image.y = projectile.posY
						if (game.global.projectiles[projectile.id].image.visible === false) {
							game.global.projectiles[projectile.id].image.angle = projectile.facingAngle
							game.global.projectiles[projectile.id].image.visible = true
						}
					} else {
						if (projectile.isHit) {
							// we load explosion
							let explosion = game.add.sprite(projectile.posX, projectile.posY, 'explosion')
							explosion.animations.add('explosion')
							explosion.anchor.setTo(0.5, 0.5)
							explosion.scale.setTo(2, 2)
							explosion.animations.play('explosion', 15, false, true)
						}
						game.global.projectiles[projectile.id].image.visible = false
					}
				}
			}
			break
		case 'REMOVE PLAYER' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] REMOVE PLAYER message recieved')
				console.dir(msg.players)
			}
			game.global.otherPlayers[msg.id].image.destroy()
			game.global.otherPlayers[msg.id].player_name.destroy()
			game.global.otherPlayers[msg.id].life.destroy()
			game.global.otherPlayers[msg.id].ammo.destroy()
			game.global.otherPlayers[msg.id].fuel.destroy()
			delete game.global.otherPlayers[msg.id]
			break
		case 'CHAT':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] CHAT PLAYERS message recieved')
				console.dir(msg)
			}
			if(game.global.segundoMensaje){
				game.global.mensajeChat3=game.global.mensajeChat2;
				game.global.mensajeChat2=game.global.mensajeChat;
				game.global.mensajeChat=(msg.player+": "+msg.mensaje);
				console.log("Mensaje enviado por "+msg.player+": "+msg.mensaje)
			}else if(game.global.primerMensaje){
				game.global.mensajeChat2=game.global.mensajeChat;
				game.global.mensajeChat=(msg.player+": "+msg.mensaje);
				console.log("Mensaje enviado por "+msg.player+": "+msg.mensaje)
				game.global.segundoMensaje=true;
			}
			else{
				game.global.primerMensaje=true;
				game.global.mensajeChat=(msg.player+": "+msg.mensaje);
				console.log("Mensaje enviado por "+msg.player+": "+msg.mensaje)
			}
			
			break
		case 'NEW NAME CLIENT':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] NEW NAME message recieved')
				console.dir(msg)
			}
			game.global.myPlayer.player_name=msg.player_name;
			break
		case 'VARIABLES RESETED':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] RESET VARIABLES message recieved')
				console.dir(msg)
			}
			game.global.myPlayer.ammo=msg.ammo;
			game.global.myPlayer.life=msg.life;
			game.global.myPlayer.puntuacion=msg.puntuation;
		default :
			console.dir(msg)
			break
		
		}
	}

	// PHASER SCENE CONFIGURATOR
	game.state.add('bootState', Spacewar.bootState)
	game.state.add('preloadState', Spacewar.preloadState)
	game.state.add('menuState', Spacewar.menuState)
	game.state.add('lobbyState', Spacewar.lobbyState)
	game.state.add('matchmakingState', Spacewar.matchmakingState)
	game.state.add('roomState', Spacewar.roomState)
	game.state.add('gameState', Spacewar.gameState)
	game.state.add('puntuationState', Spacewar.puntuationState)

	game.state.start('bootState')

}