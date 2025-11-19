package com.example.backend.controller.socket;

import org.springframework.stereotype.Component;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;

@Component
public class ChatSocketHandler {

    private final SocketIOServer server;

    public ChatSocketHandler(SocketIOServer server) {
        this.server = server;
    }

    @OnConnect
    public void onConnect(com.corundumstudio.socketio.SocketIOClient client) {
        System.out.println("Client connected: " + client.getSessionId());
        String branchId = client.getHandshakeData().getSingleUrlParam("branchId");
        if (branchId != null) {
            client.joinRoom(branchId);
            System.out.println("Client joined room with branchId: " + branchId);
        }
    }

    @OnDisconnect
    public void onDisconnect(com.corundumstudio.socketio.SocketIOClient client) {
        System.out.println("Client disconnected: " + client.getSessionId());
    }

    @OnEvent("chat_message")
    public void onChatMessage(com.corundumstudio.socketio.SocketIOClient client, String data) {
        System.out.println("Received: " + data);
        server.getBroadcastOperations().sendEvent("chat_message", "Server: " + data);
    }
}