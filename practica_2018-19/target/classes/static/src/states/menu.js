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
		
		botonJoin = game.add.button(game.world.centerX - 95, 400, 'boton', createRoomFunc, this, 2, 1, 0);
		botonJoin.scale.setTo(0.070, 0.070)
		
		text = game.add.text(game.world.centerX - 20, 420, "Play",{font:"30px Arial",fill:"#ffffff",align:"center"})
		text.anchor.set(0.5)
		
		
		
		function createRoomFunc(){
			this.ready = true;
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
