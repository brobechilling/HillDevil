package com.example.backend.repository;

import com.example.backend.entities.Customization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CustomizationRepository extends JpaRepository<Customization, UUID> {
}
