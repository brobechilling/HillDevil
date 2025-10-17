package com.example.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entities.RefreshToken;

import jakarta.transaction.Transactional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String>, RefreshTokenCustomRepository {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    
    @Modifying
    @Transactional
    @Query(
        value = "UPDATE refresh_token SET revoked = TRUE WHERE user_id = :userId",
        nativeQuery = true
    )
    int revokeAllByUserId(@Param("userId") UUID userId);


}

