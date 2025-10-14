package com.example.backend.repository;

import java.time.Instant;

public interface RefreshTokenCustomRepository {
    int deleteExpiredTokensBatch(Instant now, int batchSize);
}

