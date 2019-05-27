Spacewar.menuState = function(game) {

}

var distance = 300
var speed = 6
var star;
var texture;

var max = 400;
var xx = []
var yy= []
var zz = []

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
		
		playButton = game.add.button(game.world.centerX-75, game.world.centerY, 'play', enterLobbyFunc, this, 2, 1, 0);
		playButton.scale.setTo(0.25, 0.25)
		
		introducirNombre= game.add.button(game.world.centerX-centerBotonsX,
			centerBotonsY -200, 'nombre', enterUserName, this, 2, 1, 0);
		introducirNombre.scale.setTo(1, 1)
		
		function enterLobbyFunc(){
			this.ready = true;
		}

		function enterUserName() {
			var name_input = window.prompt("Choose a name")
			
			if (name_input === null){
				return
			}
			
			while (name_input===''){
				input = window.prompt("Choose a name")
				
			}
			let message = {
				event : 'NEW NAME',
				player_name: name_input,
			}
			game.global.socket.send(JSON.stringify(message))
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
			game.state.start('lobbyState')	
		}
	}
}
