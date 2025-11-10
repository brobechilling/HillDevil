package com.example.backend.repository;

import com.example.backend.entities.PackageFeature;
import com.example.backend.entities.PackageFeatureId;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PackageFeatureRepository extends JpaRepository<PackageFeature, PackageFeatureId> {

    Optional<PackageFeature> findByaPackage_PackageIdAndFeature_FeatureId(UUID packageId, UUID featureId);

    @EntityGraph(attributePaths = {"feature"})
    @Query("SELECT pf FROM PackageFeature pf WHERE pf.aPackage.packageId = :packageId")
    List<PackageFeature> findByPackageId(UUID packageId);
}
