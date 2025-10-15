package com.example.backend.repository;

import java.time.Instant;

public interface InvalidJwtTokenCustomRepository {
    int deleteExpiredTokensBatch(Instant now, int batchSize);
}
