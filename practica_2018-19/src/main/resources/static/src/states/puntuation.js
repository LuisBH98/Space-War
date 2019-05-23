Spacewar.puntuationState = function(game) {

}

Spacewar.puntuationState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **PUNTUATION** state");
		}
		let message = {
				event: 'REMOVE ROOM',
				room:game.global.myPlayer.room
		}
		game.global.socket.send(JSON.stringify(message));
        console.log(game.global.myPlayer.player_name)
        console.log(game.global.myPlayer.perdedor)
        console.log(game.global.myPlayer.life)
        console.log(game.global.myPlayer.puntuacion)
	},

	preload : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Joining room...");
		}
	},

	create : function() {
		game.add.sprite(0,0,'back')
		
		var back_button = game.add.button(game.world.centerX, 550, 'back_button', backToMenu, this, 2, 1, 0);
		back_button.scale.setTo(0.125, 0.125)
		back_button.anchor.setTo(0.5,0.5)
		
		var title = game.add.sprite(game.world.centerX,50,'puntuation')
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
		
        
        function backToMenu(){
        	game.global.myPlayer = new Object();
    		game.global.otherPlayers = [];
        	game.state.start('lobbyState')
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
	}
}