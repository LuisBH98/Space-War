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

	private ConcurrentHashMap<String, SpacewarGame> salas = new ConcurrentHashMap<>();
	private static final String PLAYER_ATTRIBUTE = "PLAYER";
	private ObjectMapper mapper = new ObjectMapper();
	private AtomicInteger playerId = new AtomicInteger(0);
	private AtomicInteger projectileId = new AtomicInteger(0);
	private Semaphore sessionPermit = new Semaphore(1);

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		sessionPermit.acquire();
		Player player = new Player(playerId.incrementAndGet(), session);
		session.getAttributes().put(PLAYER_ATTRIBUTE, player);
		sessionPermit.release();

		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "JOIN");
		msg.put("id", player.getPlayerId());
		msg.put("shipType", player.getShipType());
		msg.put("player_name", player.getPlayerName());
		msg.put("life", player.getPlayerLife());
		msg.put("ammo", player.getPlayerAmmo());
		player.getSession().sendMessage(new TextMessage(msg.toString()));

	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		try {
			JsonNode node = mapper.readTree(message.getPayload());
			ObjectNode msg = mapper.createObjectNode();
			sessionPermit.acquire();
			Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);
			sessionPermit.release();
			String nombreSala;

			switch (node.get("event").asText()) {
			case "JOIN":
				msg.put("event", "JOIN");
				msg.put("id", player.getPlayerId());
				msg.put("shipType", player.getShipType());
				msg.put("player_name", player.getPlayerName());
				msg.put("life", player.getPlayerLife());
				msg.put("ammo", player.getPlayerAmmo());
				player.getSession().sendMessage(new TextMessage(msg.toString()));
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
				player.getSession().sendMessage(new TextMessage(msg.toString()));
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
				player.getSession().sendMessage(new TextMessage(msg.toString()));
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
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "PLAYERS":
				nombreSala = node.get("room").asText();
				if (salas.containsKey(nombreSala)) {
					msg.put("event", "NUM_PLAYERS");
					msg.put("players", salas.get(nombreSala).getPlayers().size());
				}else {
					msg.put("event", "NEED TO CREATE ROOMS");
				}
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "UPDATE MOVEMENT":
				nombreSala = node.get("room").asText();
				player.loadMovement(node.path("movement").get("thrust").asBoolean(),
						node.path("movement").get("brake").asBoolean(),
						node.path("movement").get("rotLeft").asBoolean(),
						node.path("movement").get("rotRight").asBoolean());
				if (node.path("bullet").asBoolean()) {
					player.setPlayerAmmo(player.getPlayerAmmo() - 1);
					Projectile projectile = new Projectile(player, this.projectileId.incrementAndGet());
					salas.get(nombreSala).addProjectile(projectile.getId(), projectile);
				}
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
		sessionPermit.acquire();
		Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);
		sessionPermit.release();
		for (String clave : salas.keySet()) {
			if (salas.get(clave).getPlayers().contains(player)) {
				ObjectNode msg = mapper.createObjectNode();
				salas.get(clave).removePlayer(player);
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
