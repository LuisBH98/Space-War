Spacewar.preloadState = function(game) {

}

Spacewar.preloadState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **PRELOAD** state");
		}
	},

	preload : function() {
		game.load.atlas('spacewar', 'assets/atlas/spacewar.png',
				'assets/atlas/spacewar.json',
				Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
		game.load.atlas('explosion', 'assets/atlas/explosion.png',
				'assets/atlas/explosion.json',
				Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
		game.load.image('boton','assets/images/button.png')
		game.load.image('back','assets/images/fondo2.jpg')
		game.load.image('title','assets/images/title.png')
		game.load.image('star','assets/images/star2.png')
		game.load.image('puntuation','assets/images/hallOfFame.png')
		game.load.image('back_button','assets/images/back_button.png')
		game.load.image('create_room','assets/images/createRoom_button.png')
		game.load.image('joinRoom','assets/images/joinAnyRoom_button.png')
		game.load.image('joinSpecific','assets/images/joinSpecificRoom_button.png')
		game.load.image('play','assets/images/play_button.png')
		game.load.image('salaEspera','assets/images/salaEspera.png')
		game.load.image('chat','assets/images/chat.png')
		game.load.image('nombre','assets/images/nombre.png')
		game.load.image('choose_name','assets/images/name_button.png')
		game.load.image('send_message','assets/images/message_button.png')
		game.load.image('waiting','assets/images/matchmaking_text.png')
	},

	create : function() {
		
	},

	update : function() {
		game.state.start('menuState')
	}
}