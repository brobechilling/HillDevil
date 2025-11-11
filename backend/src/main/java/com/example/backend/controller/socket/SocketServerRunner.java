package com.example.backend.controller.socket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.corundumstudio.socketio.SocketIOServer;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Component
public class SocketServerRunner {

    private final SocketIOServer server;
    private Logger logger;

    public SocketServerRunner(SocketIOServer server) {
        this.server = server;
        logger = LoggerFactory.getLogger(getClass());
    }

    @PostConstruct
    public void start() {
        server.start();
        logger.info("Socket server start running on port: " + server.getConfiguration().getPort());
    }

    @PreDestroy
    public void stop() {
        server.stop();
        logger.info("Socket server stop");
    }
}