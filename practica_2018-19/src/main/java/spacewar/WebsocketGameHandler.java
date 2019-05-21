package spacewar;

import java.util.concurrent.ConcurrentHashMap;
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
	private SpacewarGame game = new SpacewarGame("Room1", 2, "1vs1");
	private SpacewarGame game2 = new SpacewarGame("Room2", 2, "1vs1");
	private static final String PLAYER_ATTRIBUTE = "PLAYER";
	private ObjectMapper mapper = new ObjectMapper();
	private AtomicInteger playerId = new AtomicInteger(0);
	private AtomicInteger projectileId = new AtomicInteger(0);
	private String nombreSala;

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		Player player = new Player(playerId.incrementAndGet(), session);
		session.getAttributes().put(PLAYER_ATTRIBUTE, player);

		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "JOIN");
		msg.put("id", player.getPlayerId());
		msg.put("shipType", player.getShipType());
		msg.put("player_name", player.getPlayerName());
		msg.put("life", player.getPlayerLife());
		msg.put("ammo", player.getPlayerAmmo());
		player.getSession().sendMessage(new TextMessage(msg.toString()));

		salas.putIfAbsent(game.nombreSala, game);
		salas.putIfAbsent(game2.nombreSala, game2);
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		try {
			JsonNode node = mapper.readTree(message.getPayload());
			ObjectNode msg = mapper.createObjectNode();
			Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);

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
			case "ROOM1":
				this.nombreSala = node.get("room").asText();
				msg.put("event", "NEW ROOM");
				msg.put("room", this.nombreSala);
				salas.get(this.nombreSala).addPlayer(player);
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "ROOM2":
				this.nombreSala = node.get("room").asText();
				msg.put("event", "NEW ROOM");
				msg.put("room", this.nombreSala);
				salas.get(this.nombreSala).addPlayer(player);
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "PLAYERS":
				this.nombreSala = node.get("room").asText();
				msg.put("event", "NUM_PLAYERS");
				msg.put("players", salas.get(this.nombreSala).getPlayers().size());
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "UPDATE MOVEMENT":
				this.nombreSala = node.get("room").asText();
				player.loadMovement(node.path("movement").get("thrust").asBoolean(),
						node.path("movement").get("brake").asBoolean(),
						node.path("movement").get("rotLeft").asBoolean(),
						node.path("movement").get("rotRight").asBoolean());
				if (node.path("bullet").asBoolean()) {
					player.setPlayerAmmo(player.getPlayerAmmo() - 1);
					Projectile projectile = new Projectile(player, this.projectileId.incrementAndGet());
					salas.get(this.nombreSala).addProjectile(projectile.getId(), projectile);
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
		Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);
		
		if (game.getPlayers().contains(player)) {
			game.removePlayer(player);
			ObjectNode msg = mapper.createObjectNode();
			msg.put("event", "REMOVE PLAYER");
			msg.put("id", player.getPlayerId());
			game.broadcast(msg.toString());

		}
	}
}
