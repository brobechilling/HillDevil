package com.example.backend.controller.socket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.corundumstudio.socketio.SocketIOClient;

@Component
public class TestChatSocket {

    private final SocketIOServer  server;
    private Logger logger;

    public TestChatSocket(SocketIOServer server) {
        this.server = server;
        logger = LoggerFactory.getLogger(getClass());
    }

    @OnConnect
    public void onConnect(SocketIOClient client) {
        logger.info("Client connected with sessionId: " + client.getSessionId());
    }

    @OnDisconnect
    public void onDisconnect(SocketIOClient client) {
        logger.info("Client disconnected with sessionId: " + client.getSessionId());        
    }

    @OnEvent("chat_message")
    public void onChatMessage(SocketIOClient client, String data) {
        logger.info("Receive message: " + data);
        server.getBroadcastOperations().sendEvent("chat_message", "Server: " + data);
    }

}
