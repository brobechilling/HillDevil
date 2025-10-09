package com.example.backend.entities;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class PackageFeatureId implements Serializable {

    @Column(name = "package_id")
    private UUID packageId;

    @Column(name = "feature_id")
    private UUID featureId;

    public PackageFeatureId() {}

    public PackageFeatureId(UUID packageId, UUID featureId) {
        this.packageId = packageId;
        this.featureId = featureId;
    }

    public UUID getPackageId() {
        return packageId;
    }

    public void setPackageId(UUID packageId) {
        this.packageId = packageId;
    }

    public UUID getFeatureId() {
        return featureId;
    }

    public void setFeatureId(UUID featureId) {
        this.featureId = featureId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PackageFeatureId)) return false;
        PackageFeatureId that = (PackageFeatureId) o;
        return Objects.equals(packageId, that.packageId) &&
               Objects.equals(featureId, that.featureId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(packageId, featureId);
    }

    
}