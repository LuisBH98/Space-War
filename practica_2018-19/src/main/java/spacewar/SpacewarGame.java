package spacewar;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.springframework.web.socket.TextMessage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class SpacewarGame {

	private final static int FPS = 30;
	private final static int MAX_PUNTUACION = 3;
	private final static int MIN_JUGADORES = 1;
	private final static int MAX_LIFE = 100;
	private final static int MAX_AMMO = 50;
	private final static long TICK_DELAY = 1000 / FPS;
	public final static boolean DEBUG_MODE = true;
	public final static boolean VERBOSE_MODE = true;
	public int maximoJugadores;
	public String nombreSala;
	public String modoJuego;

	ObjectMapper mapper = new ObjectMapper();
	private ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

	// GLOBAL GAME ROOM
	private Map<String, Player> players = new ConcurrentHashMap<>();
	private Map<Integer, Projectile> projectiles = new ConcurrentHashMap<>();
	private AtomicInteger numPlayers = new AtomicInteger();
	public Lock endGamePermit = new ReentrantLock();
	boolean endGame = false;

	public SpacewarGame(String nombreSala, int maximoJugadores, String modoJuego) {
		this.nombreSala = nombreSala;
		this.maximoJugadores = maximoJugadores;
		this.modoJuego = modoJuego;

	}

	// Comprobar si se puede entrar en la sala por su numero de jugadores
	public boolean available() {
		if (this.numPlayers.get() < maximoJugadores) {
			return true;
		} else {
			return false;
		}
	}

	public void addPlayer(Player player) {
		if (players.values().size() < this.maximoJugadores) {
			players.put(player.getSession().getId(), player);

			int count = numPlayers.incrementAndGet();
			if (count == this.maximoJugadores) {
				this.startGameLoop();
			}
		}
	}

	public Collection<Player> getPlayers() {
		return players.values();
	}

	public void removePlayer(Player player) {
		players.remove(player.getSession().getId());

		int count = this.numPlayers.decrementAndGet();
		if (count == 0) {
			this.stopGameLoop();
		}
	}

	public void addProjectile(int id, Projectile projectile) {
		projectiles.put(id, projectile);
	}

	public Collection<Projectile> getProjectiles() {
		return projectiles.values();
	}

	public void removeProjectile(Projectile projectile) {
		players.remove(projectile.getId(), projectile);
	}

	public void startGameLoop() {
		scheduler = Executors.newScheduledThreadPool(1);
		scheduler.scheduleAtFixedRate(() -> tick(), TICK_DELAY, TICK_DELAY, TimeUnit.MILLISECONDS);
	}

	public void stopGameLoop() {
		if (scheduler != null) {
			scheduler.shutdown();
		}
	}

	public void broadcast(String message) {
		for (Player player : getPlayers()) {
			try {
				player.sendMessagePlayer.lock();
				player.getSession().sendMessage(new TextMessage(message.toString()));
				player.sendMessagePlayer.unlock();
			} catch (Throwable ex) {
				System.err.println("Execption sending message to player " + player.getSession().getId());
				ex.printStackTrace(System.err);
				this.removePlayer(player);
			}
		}
	}

	private void tick() {
		ObjectNode json = mapper.createObjectNode();
		ArrayNode arrayNodePlayers = mapper.createArrayNode();
		ArrayNode arrayNodePlayersEndGame = mapper.createArrayNode();
		ArrayNode arrayNodeProjectiles = mapper.createArrayNode();

		long thisInstant = System.currentTimeMillis();
		Set<Integer> bullets2Remove = new HashSet<>();
		boolean removeBullets = false;

		
		try {
			if(this.numPlayers.get()==MIN_JUGADORES) {
				this.stopGameLoop();
			}
			// Update players
			for (Player player : getPlayers()) {
				if (player.getPuntuacion() >= MAX_PUNTUACION) {
					player.setGanador(true);
					for (Player playerReset : getPlayers()) {
						playerReset.setPlayerLife(MAX_LIFE);
						playerReset.setPlayerAmmo(MAX_AMMO);
					}
					this.stopGameLoop();
				}
				player.calculateMovement(player.getPlayerFuel());
				player.setPerdedor(false);
				ObjectNode jsonPlayer = mapper.createObjectNode();
				jsonPlayer.put("id", player.getPlayerId());
				jsonPlayer.put("player_name", player.getPlayerName());
				jsonPlayer.put("life", player.getPlayerLife());
				jsonPlayer.put("ammo", player.getPlayerAmmo());
				jsonPlayer.put("shipType", player.getShipType());
				jsonPlayer.put("posX", player.getPosX());
				jsonPlayer.put("posY", player.getPosY());
				jsonPlayer.put("facingAngle", player.getFacingAngle());
				jsonPlayer.put("perdedor", player.getPerdedor());
				jsonPlayer.put("puntuacion", player.getPuntuacion());
				jsonPlayer.put("fuel", player.getPlayerFuel());
				arrayNodePlayers.addPOJO(jsonPlayer);
			}
			
			// Update bullets and handle collision
			for (Projectile projectile : getProjectiles()) {
				projectile.applyVelocity2Position();

				// Handle collision
				for (Player player : getPlayers()) {
					if ((projectile.getOwner().getPlayerId() != player.getPlayerId()) && player.intersect(projectile)) {
						// System.out.println("Player " + player.getPlayerId() + " was hit!!!");
						projectile.setHit(true);
						player.setPlayerLife(player.getPlayerLife() - 10);
						if(player.getPlayerLife()<=0) {
							projectile.getOwner().sumaPunto();
							player.initSpaceship(Math.random() * 1000, Math.random() * 600, Math.random() * 360);
							player.setPlayerLife(MAX_LIFE);
							player.setPlayerAmmo(MAX_AMMO);
						}
						break;
					}
				}

				ObjectNode jsonProjectile = mapper.createObjectNode();
				jsonProjectile.put("id", projectile.getId());

				if (!projectile.isHit() && projectile.isAlive(thisInstant)) {
					jsonProjectile.put("posX", projectile.getPosX());
					jsonProjectile.put("posY", projectile.getPosY());
					jsonProjectile.put("facingAngle", projectile.getFacingAngle());
					jsonProjectile.put("isAlive", true);
				} else {
					removeBullets = true;
					bullets2Remove.add(projectile.getId());
					jsonProjectile.put("isAlive", false);
					if (projectile.isHit()) {
						jsonProjectile.put("isHit", true);
						jsonProjectile.put("posX", projectile.getPosX());
						jsonProjectile.put("posY", projectile.getPosY());
					}
				}
				arrayNodeProjectiles.addPOJO(jsonProjectile);
			}

			if (removeBullets)
				this.projectiles.keySet().removeAll(bullets2Remove);

			json.put("event", "GAME STATE UPDATE");
			json.putPOJO("players", arrayNodePlayers);
			json.putPOJO("projectiles", arrayNodeProjectiles);
			json.putPOJO("puntuacionMaxima", MAX_PUNTUACION);
			this.broadcast(json.toString());

		} catch (Throwable ex) {

		}
	}

	public void handleCollision() {

	}
}
