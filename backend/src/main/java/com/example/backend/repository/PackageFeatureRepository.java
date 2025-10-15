package com.example.backend.repository;

import com.example.backend.entities.PackageFeature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PackageFeatureRepository extends JpaRepository<PackageFeature, UUID> {

    Optional<PackageFeature> findByaPackage_PackageIdAndFeature_FeatureId(UUID packageId, UUID featureId);
    List<PackageFeature> findByaPackage_PackageId(UUID aPackagePackageId);
}
