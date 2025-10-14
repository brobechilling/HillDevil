package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entities.InvalidJwtToken;

@Repository
public interface InvalidJwtTokenRepository extends JpaRepository<InvalidJwtToken, String>, InvalidJwtTokenCustomRepository  {
    
}
