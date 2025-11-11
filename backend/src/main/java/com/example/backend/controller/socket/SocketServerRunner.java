package com.example.backend.controller.socket;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.corundumstudio.socketio.SocketIOServer;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Component
public class SocketServerRunner {

    private final SocketIOServer server;
    private final List<Object> socketHandlers;
    private Logger logger;

    public SocketServerRunner(SocketIOServer server, List<Object> socketHandlers) {
        this.server = server;
        logger = LoggerFactory.getLogger(getClass());
        this.socketHandlers = socketHandlers;
    }

    @PostConstruct
    public void start() {
        server.start();
        socketHandlers.forEach(server::addListeners);
        logger.info("Socket server start running on port: " + server.getConfiguration().getPort());
    }

    @PreDestroy
    public void stop() {
        server.stop();
        logger.info("Socket server stop");
    }
}