package spacewar;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class WebsocketGameHandler extends TextWebSocketHandler {

	public ConcurrentHashMap<String, SpacewarGame> salas = new ConcurrentHashMap<>();
	private static final String PLAYER_ATTRIBUTE = "PLAYER";
	private final static int MAX_AMMO = 20;
	private ObjectMapper mapper = new ObjectMapper();
	private AtomicInteger playerId = new AtomicInteger(0);
	private AtomicInteger projectileId = new AtomicInteger(0);
	private Lock adquirirPermiso = new ReentrantLock();
	private final static int MIN_PUNTUACION = 0;
	private final static int MAX_LIFE = 100;
	private final static int MAX_FUEL = 100;
	private final static int FUEL_COST = 10;
	private final static int FUEL_RECHARGE = 1;
	

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		adquirirPermiso.lock();
		WebSocketSession sessionLocal=session;
		adquirirPermiso.unlock();
		Player player = new Player(playerId.incrementAndGet(), sessionLocal);
		sessionLocal.getAttributes().put(PLAYER_ATTRIBUTE, player);

		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "JOIN");
		msg.put("id", player.getPlayerId());
		msg.put("shipType", player.getShipType());
		msg.put("player_name", player.getPlayerName());
		msg.put("life", player.getPlayerLife());
		msg.put("ammo", player.getPlayerAmmo());
		msg.put("fuel", player.getPlayerFuel());
		player.sendMessagePlayer.lock();
		player.getSession().sendMessage(new TextMessage(msg.toString()));
		player.sendMessagePlayer.unlock();

	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		try {
			JsonNode node = mapper.readTree(message.getPayload());
			ObjectNode msg = mapper.createObjectNode();
			Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);
			String nombreSala, mensaje, nombrePlayer;

			switch (node.get("event").asText()) {
			case "JOIN":
				msg.put("event", "JOIN");
				msg.put("id", player.getPlayerId());
				msg.put("shipType", player.getShipType());
				msg.put("player_name", player.getPlayerName());
				msg.put("life", player.getPlayerLife());
				msg.put("ammo", player.getPlayerAmmo());
				msg.put("fuel", player.getPlayerFuel());
				player.sendMessagePlayer.lock();
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				player.sendMessagePlayer.unlock();
				break;
			case "CREATE NEW ROOM":
				nombreSala = node.get("room").asText();
				if (!salas.containsKey(nombreSala)) {
					msg.put("event", "JOIN ROOM");
					msg.put("room", nombreSala);
					SpacewarGame game = new SpacewarGame(nombreSala, 2, "1vs1");
					salas.putIfAbsent(nombreSala, game);
					salas.get(nombreSala).addPlayer(player);
				} else {
					msg.put("event", "ANOTHER ROOM NAME");
					msg.put("room", nombreSala);
				}
				player.sendMessagePlayer.lock();
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				player.sendMessagePlayer.unlock();
				break;
			case "JOIN ANY ROOM":
				boolean addedPlayer = false;
				for (String clave : salas.keySet()) {
					if (salas.get(clave).available()) {
						msg.put("event", "JOIN ROOM");
						msg.put("room", clave);
						salas.get(clave).addPlayer(player);
						addedPlayer = true;
						break;
					}
				}
				if (!addedPlayer) {
					msg.put("event", "ROOMS OCCUPIED");
				}
				player.sendMessagePlayer.lock();
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				player.sendMessagePlayer.unlock();
				break;
			case "JOIN SPECIFIC ROOM":
				nombreSala = node.get("room").asText();
				if (salas.containsKey(nombreSala)) {
					if (salas.get(nombreSala).available()) {
						msg.put("event", "JOIN ROOM");
						msg.put("room", nombreSala);
						salas.get(nombreSala).addPlayer(player);
					} else {
						msg.put("event", "ROOMS OCCUPIED");
						msg.put("room", nombreSala);
					}
				}else {
					msg.put("event", "NEED TO CREATE ROOMS");
					msg.put("room", nombreSala);
				}
				player.sendMessagePlayer.lock();
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				player.sendMessagePlayer.unlock();
				break;
			case "PLAYERS":
				nombreSala = node.get("room").asText();
				if (salas.containsKey(nombreSala)) {
					msg.put("event", "NUM_PLAYERS");
					msg.put("players", salas.get(nombreSala).getPlayers().size());
				}else {
					msg.put("event", "NEED TO CREATE ROOMS");
				}
				player.sendMessagePlayer.lock();
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				player.sendMessagePlayer.unlock();
				break;
			case "UPDATE MOVEMENT":
				nombreSala = node.get("room").asText();
				player.loadMovement(node.path("movement").get("thrust").asBoolean(),
						node.path("movement").get("brake").asBoolean(),
						node.path("movement").get("rotLeft").asBoolean(),
						node.path("movement").get("rotRight").asBoolean(),
						node.path("movement").get("fast").asBoolean());
				if(node.path("movement").get("fast").asBoolean() && player.getPlayerFuel()-FUEL_COST >= 0 && node.path("movement").get("thrust").asBoolean()) {
					player.setPlayerFuel(player.getPlayerFuel() - FUEL_COST);
				}else{
					if(player.getPlayerFuel() < 100 && !node.path("movement").get("fast").asBoolean()){
						player.setPlayerFuel(player.getPlayerFuel() + FUEL_RECHARGE);
					}
				}
				if (node.path("bullet").asBoolean()) {
					player.setPlayerAmmo(player.getPlayerAmmo() - 1);
					Projectile projectile = new Projectile(player, this.projectileId.incrementAndGet());
					salas.get(nombreSala).addProjectile(projectile.getId(), projectile);
				}
				if(player.getPlayerAmmo() < MAX_AMMO && node.get("recharge").asBoolean()) {
					player.setPlayerAmmo(MAX_AMMO);
				}
				break;
			case "REMOVE ROOM":
				nombreSala = node.get("room").asText();
				salas.remove(nombreSala);
				break;
			case "CHAT ROOM":
				nombreSala = node.get("room").asText();
				nombrePlayer = node.get("player").asText();
				mensaje = node.get("mensaje").asText();
				msg.put("event", "CHAT");
				msg.put("player",nombrePlayer);
				msg.put("mensaje",mensaje);

				salas.get(nombreSala).broadcast(msg.toString());
				break;
			case "NEW NAME":
				nombrePlayer = node.get("player_name").asText();
				msg.put("event", "NEW NAME CLIENT");
				msg.put("player_name", nombrePlayer);
				player.setPlayerName(nombrePlayer);
				player.sendMessagePlayer.lock();
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				player.sendMessagePlayer.unlock();
				break;
			case "RESET VARIABLES":
				player.setGanador(false);
				player.setPlayerAmmo(MAX_AMMO);
				player.setPlayerFuel(MAX_FUEL);
				player.setPlayerLife(MAX_LIFE);
				player.setPuntuacion(MIN_PUNTUACION);
				msg.put("event", "VARIABLES RESETED");
				msg.put("ammo", MAX_AMMO);
				msg.put("life", MAX_LIFE);
				msg.put("puntuation", MIN_PUNTUACION);
				player.sendMessagePlayer.lock();
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				player.sendMessagePlayer.unlock();
				break;
			default:
				break;
			}

		} catch (Exception e) {
			System.err.println("Exception processing message " + message.getPayload());
			e.printStackTrace(System.err);
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);
		for (String clave : salas.keySet()) {
			if (salas.get(clave).getPlayers().contains(player)) {
				salas.get(clave).removePlayer(player);
				ObjectNode msg = mapper.createObjectNode();
				msg.put("event", "REMOVE PLAYER");
				msg.put("id", player.getPlayerId());
				salas.get(clave).broadcast(msg.toString());
				if (salas.get(clave).getPlayers().size() <= 0) {
					salas.remove(clave);
				}
			}
		}
	}
}
