package com.example.backend.entities;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

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
    

}
