package com.example.backend.repository;

import java.time.Instant;

import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;

@Repository
public class RefreshTokenCustomRepositoryImpl implements RefreshTokenCustomRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public int deleteExpiredTokensBatch(Instant now, int batchSize) {
        String sql = """
            WITH delete_batch AS (
                SELECT ctid
                FROM refresh_token
                WHERE expires_at < :now
                ORDER BY expires_at
                FOR UPDATE
                LIMIT :batchSize
            )
            DELETE FROM refresh_token AS t
            USING delete_batch AS del
            WHERE t.ctid = del.ctid
            """;

        Query query = entityManager.createNativeQuery(sql)
                .setParameter("now", now)
                .setParameter("batchSize", batchSize);
        return query.executeUpdate();
    }
    
}
