package com.example.backend.repository;

import com.example.backend.entities.PackageFeature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PackageFeatureRepository extends JpaRepository<PackageFeature, UUID> {

    void deleteByPackage_PackageId(UUID packageId);

    List<PackageFeature> findByPackage_PackageId(UUID packageId);
}
