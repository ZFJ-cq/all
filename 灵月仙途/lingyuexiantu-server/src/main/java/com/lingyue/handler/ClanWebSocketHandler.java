package com.lingyue.handler;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ClanWebSocketHandler extends TextWebSocketHandler {

    private final Map<Long, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // 从 session 中获取角色 ID
        Long roleId = getRoleIdFromSession(session);
        if (roleId != null) {
            sessions.put(roleId, session);
            System.out.println("WebSocket 连接建立：roleId=" + roleId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // 处理客户端消息
        String payload = message.getPayload();
        System.out.println("收到消息：" + payload);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long roleId = getRoleIdFromSession(session);
        if (roleId != null) {
            sessions.remove(roleId);
            System.out.println("WebSocket 连接关闭：roleId=" + roleId);
        }
    }

    private Long getRoleIdFromSession(WebSocketSession session) {
        // 从 session 中获取角色 ID，这里需要根据实际的 session 存储方式来实现
        // 暂时返回 null，实际实现时需要从 session 中获取
        return null;
    }

    public void sendClanNotification(Long roleId, String message) {
        WebSocketSession session = sessions.get(roleId);
        if (session != null && session.isOpen()) {
            try {
                TextMessage textMessage = new TextMessage(message);
                session.sendMessage(textMessage);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public void sendClanNotificationToAll(String message) {
        for (WebSocketSession session : sessions.values()) {
            if (session.isOpen()) {
                try {
                    TextMessage textMessage = new TextMessage(message);
                    session.sendMessage(textMessage);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
