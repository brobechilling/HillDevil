package com.example.backend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "package_feature")
public class PackageFeature {

    @EmbeddedId
    private PackageFeatureId id = new PackageFeatureId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("packageId")
    @JoinColumn(name = "package_id", nullable = false)
    private Package aPackage; // package is java keyword

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("featureId")
    @JoinColumn(name = "feature_id", nullable = false)
    private Feature feature;

    @Column(name = "value")
    private int value;

    public PackageFeature() {}

    public PackageFeature(Package aPackage, Feature feature, int value) {
        this.aPackage = aPackage;
        this.feature = feature;
        this.value = value;
        this.id = new PackageFeatureId(aPackage.getPackageId(), feature.getFeatureId());
    }

    public PackageFeatureId getId() {
        return id;
    }

    public void setId(PackageFeatureId id) {
        this.id = id;
    }

    public Package getaPackage() {
        return aPackage;
    }

    public void setaPackage(Package aPackage) {
        this.aPackage = aPackage;
    }

    public Feature getFeature() {
        return feature;
    }

    public void setFeature(Feature feature) {
        this.feature = feature;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }

}
