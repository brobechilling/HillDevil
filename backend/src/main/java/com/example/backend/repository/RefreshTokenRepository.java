package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.RefreshToken;
import com.example.backend.entities.User;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
}

