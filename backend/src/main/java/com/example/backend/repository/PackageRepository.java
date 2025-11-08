package com.example.backend.repository;

import com.example.backend.entities.Package;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PackageRepository extends JpaRepository<Package, UUID> {
    Optional<Package> findById(UUID id);
    boolean existsByName(String name);

    @EntityGraph(attributePaths = {"packageFeatures", "packageFeatures.feature"})
    @Query("SELECT p FROM Package p")
    List<Package> findAllWithFeatures();

    @EntityGraph(attributePaths = {"packageFeatures", "packageFeatures.feature"})
    @Query("SELECT p FROM Package p WHERE p.packageId = :packageId")
    Optional<Package> findOneWithFeaturesByPackageId(UUID packageId);
}