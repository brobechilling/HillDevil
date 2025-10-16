package com.example.backend.dto;

import java.util.UUID;

public class FeatureValueDTO {
    private UUID featureId;
    private String featureName;
    private String description;
    private int value;

    public UUID getFeatureId() {
        return featureId;
    }

    public void setFeatureId(UUID featureId) {
        this.featureId = featureId;
    }

    public String getFeatureName() {
        return featureName;
    }

    public void setFeatureName(String featureName) {
        this.featureName = featureName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return "FeatureValueDTO{" +
                "featureId=" + featureId +
                ", featureName='" + featureName + '\'' +
                ", description='" + description + '\'' +
                ", value=" + value +
                '}';
    }
}
