package spacewar;

import java.util.Random;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

public class Player extends Spaceship {

	private final WebSocketSession session;
	private final int playerId;
	private final String shipType;
	private final String player_name;
	private boolean ganador = false;
	private int life;
	private int ammo;
	private int puntuacion = 0;

	public Player(int playerId, WebSocketSession session) {
		this.playerId = playerId;
		this.session = session;
		this.shipType = this.getRandomShipType();
		this.player_name = this.getRandomPlayerName();
		this.life = 100;
		this.ammo = 8;
	}
	
	public int getPlayerLife() {
		return this.life;
	}
	
	public void setPlayerLife(int life) {
		this.life = life;
	}
	
	public int getPlayerAmmo() {
		return this.ammo;
	}
	
	public void setPlayerAmmo(int ammo_) {
		this.ammo = ammo_;
	}
	
	public String getPlayerName() {
		return this.player_name;
	}
	
	public int getPuntuacion() {
		return this.puntuacion;
	}
	
	public void sumaPunto() {
		this.puntuacion++;
	}
	
	public void setGanador() {
		this.ganador=true;
	}

	public int getPlayerId() {
		return this.playerId;
	}

	public WebSocketSession getSession() {
		return this.session;
	}

	public void sendMessage(String msg) throws Exception {
		this.session.sendMessage(new TextMessage(msg));
	}

	public String getShipType() {
		return shipType;
	}

	private String getRandomShipType() {
		String[] randomShips = { "blue", "darkgrey", "green", "metalic", "orange", "purple", "red" };
		String ship = (randomShips[new Random().nextInt(randomShips.length)]);
		ship += "_0" + (new Random().nextInt(5) + 1) + ".png";
		return ship;
	}
	
	private String getRandomPlayerName() {
		int rnd = (int)(Math.random()*100);
		String name = "User " + rnd;
		return name;
	}
}
