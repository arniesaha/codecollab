package app;

import io.javalin.Javalin;
import io.javalin.websocket.WsSession;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.eclipse.jetty.websocket.api.Session;
import org.json.JSONObject;


public class Main {

    private static Map<String, Collab> collabs = new ConcurrentHashMap<>();
    private static Map<WsSession, String> userUsernameMap = new ConcurrentHashMap<>();
    private static int nextUserNumber = 1; // Assign to username for next connecting user
    private static String username;

    public static void main(String[] args) {

        Javalin.create()
                .enableStaticFiles("/public")
                .ws("/docs/:doc-id", ws -> {
                    ws.onConnect(session -> {
                        if (getCollab(session) == null) {
                            createCollab(session);
                        }
                        getCollab(session).sessions.add(session);
                        session.send(getCollab(session).doc);
                    });
                    ws.onMessage((session, message) -> {
                        getCollab(session).doc = message;
                        getCollab(session).sessions.stream().filter(WsSession::isOpen).forEach(s -> {
                            s.send(getCollab(session).doc);
                        });
                    });
                    ws.onClose((session, status, message) -> {
                        getCollab(session).sessions.remove(session);
                    });
                })
                .ws("/chat", ws -> {
                    ws.onConnect(session -> {
                        username = "User" + nextUserNumber++;
                        userUsernameMap.put(session, username);
                        broadcastMessage("Server", (username + " joined the chat"));
                    });
                    ws.onClose((session, status, message) -> {
                        String username = userUsernameMap.get(session);
                        userUsernameMap.remove(session);
                        broadcastMessage("Server", (username + " left the chat"));
                    });
                    ws.onMessage((session, message) -> {
                        broadcastMessage(userUsernameMap.get(session), message);
                    });
                })
                .start(7070);

    }

    private static Collab getCollab(WsSession session) {
        return collabs.get(session.pathParam("doc-id"));
    }

    private static void createCollab(WsSession session) {
        collabs.put(session.pathParam("doc-id"), new Collab());
    }

    // Sends a message from one user to all users, along with a list of current usernames
    private static void broadcastMessage(String sender, String message) {
        userUsernameMap.keySet().stream().filter(Session::isOpen).forEach(session -> {
            session.send(
                    new JSONObject()
                            .put("userMessage",  message)
                            .put("sender", sender)
                            .put("self", username)
                            .put("userlist", userUsernameMap.values()).toString()
            );
        });

    }

}