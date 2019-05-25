package spacewar;

import java.util.Random;
import java.util.concurrent.Semaphore;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

public class Player extends Spaceship {

	private final WebSocketSession session;
	private final int playerId;
	private final String shipType;
	private String player_name;
	private boolean perdedor;
	private boolean ganador;
	private int life;
	private int ammo;
	private int puntuacion;
	private int fuel;
	public Lock sendMessagePlayer = new ReentrantLock();

	public Player(int playerId, WebSocketSession session) {
		this.playerId = playerId;
		this.session = session;
		this.shipType = this.getRandomShipType();
		this.player_name = this.getRandomPlayerName();
		this.life = 100;
		this.ammo = 50;
		this.fuel = 100;
		this.perdedor=false;
		this.puntuacion=0;
	}
	
	public int getPlayerFuel() {
		return this.fuel;
	}
	
	public void setPlayerFuel(int fuel) {
		this.fuel = fuel;
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
	
	public void setPlayerAmmo(int ammo) {
		this.ammo = ammo;
	}
	
	public String getPlayerName() {
		return this.player_name;
	}
	
	public int getPuntuacion() {
		return this.puntuacion;
	}
	
	public void setPuntuacion(int puntuacion) {
		this.puntuacion = puntuacion;
	}
	
	public void sumaPunto() {
		this.puntuacion++;
	}
	
	public void setPerdedor(boolean perdedor) {
		this.perdedor=perdedor;
	}
	
	public boolean getPerdedor() {
		return this.perdedor;
	}

	public void setGanador(boolean perdedor) {
		this.ganador = ganador;
	}
	
	public boolean getGanador() {
		return this.ganador;
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
	
	public void setPlayerName(String player_name) {
		this.player_name=player_name;
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
