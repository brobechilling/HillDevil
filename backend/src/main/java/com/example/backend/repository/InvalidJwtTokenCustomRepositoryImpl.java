package com.example.backend.repository;

import java.time.Instant;

import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;

@Repository
public class InvalidJwtTokenCustomRepositoryImpl implements InvalidJwtTokenCustomRepository{

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public int deleteExpiredTokensBatch(Instant now, int batchSize) {
        String sql = """
            WITH delete_batch AS (
                SELECT ctid
                FROM invalid_jwt_token
                WHERE expiration_time < :now
                ORDER BY expiration_time
                FOR UPDATE
                LIMIT :batchSize
            )
            DELETE FROM invalid_jwt_token AS t
            USING delete_batch AS del
            WHERE t.ctid = del.ctid
            """;

        Query query = entityManager.createNativeQuery(sql)
                .setParameter("now", now)
                .setParameter("batchSize", batchSize);
        return query.executeUpdate();
    }

}
