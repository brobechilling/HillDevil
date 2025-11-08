package com.example.backend.entities;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.*;

@Entity
@Table(name = "feature")
public class Feature {

    @Id
    @Column(name = "feature_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID featureId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "code", unique = true, nullable = true, length = 100)
    private FeatureCode code;

    @OneToMany(mappedBy = "feature", cascade = CascadeType.ALL)
    private Set<PackageFeature> packageFeatures = new LinkedHashSet<>();

    public UUID getFeatureId() {
        return featureId;
    }

    public void setFeatureId(UUID featureId) {
        this.featureId = featureId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<PackageFeature> getPackageFeatures() {
        return packageFeatures;
    }

    public void setPackageFeatures(Set<PackageFeature> packageFeatures) {
        this.packageFeatures = packageFeatures;
    }

    public FeatureCode getCode() {
        return code;
    }

    public void setCode(FeatureCode code) {
        this.code = code;
    }
}
