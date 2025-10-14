package com.example.backend.service;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.backend.repository.InvalidJwtTokenRepository;
import com.example.backend.repository.RefreshTokenRepository;

import jakarta.transaction.Transactional;

@Service
public class TokenCleanupService {
    
    private final Logger logger = LoggerFactory.getLogger(TokenCleanupService.class);
    private final RefreshTokenRepository refreshTokenRepository;
    private final InvalidJwtTokenRepository invalidJwtTokenRepository;

    @Value("${schedule.cleanup-token.enabled}")
    private boolean enabled;
    @Value("${schedule.cleanup-token.batch-size}")
    private int batchSize;

    public TokenCleanupService(RefreshTokenRepository refreshTokenRepository, InvalidJwtTokenRepository invalidJwtTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.invalidJwtTokenRepository = invalidJwtTokenRepository;
    }

    @Scheduled(fixedDelayString = "${schedule.cleanup-token.fixed-delay-ms}") //10 minutes
    @Transactional
    public void cleanupExpiredTokens() {
        if (!enabled)
        {
            logger.info("Clean up token schedule is not enabled");
            return;
        }
        Instant now = Instant.now();
        int deletedInvalid = 0;
        int deletedRefresh = 0;
        do {
            deletedInvalid = invalidJwtTokenRepository.deleteExpiredTokensBatch(now, this.batchSize);
            logger.info("Deleted " + deletedInvalid + " expired invalid JWT tokens");
        } while (deletedInvalid == this.batchSize);

        do {
            deletedRefresh = refreshTokenRepository.deleteExpiredTokensBatch(now, this.batchSize);
            logger.info("Deleted " + deletedRefresh + " expired refresh tokens");
        } while (deletedRefresh == this.batchSize);
    }
}
