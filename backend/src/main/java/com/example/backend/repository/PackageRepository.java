package com.example.backend.repository;

import com.example.backend.entities.Package;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PackageRepository extends JpaRepository<Package, UUID> {
    Optional<Package> findById(UUID id);
    boolean existsByName(String name);

}