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
<<<<<<< HEAD
        game.load.image('back','assets/images/fondo.jpg')
=======
		game.load.image('back','assets/images/fondo.jpg')
>>>>>>> 177d219db31ffb533bd49485f460cbd39623313e
	},

	create : function() {
		
	},

	update : function() {
		game.state.start('menuState')
	}
}