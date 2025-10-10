package com.example.backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.TargetType;

public interface TargetTypeRepository extends JpaRepository<TargetType, UUID> {

    
} 
