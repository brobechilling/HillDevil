package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String>, RefreshTokenCustomRepository {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

}

