package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class PackageFeatureDTO {
    private UUID packageId;
    private String name;
    private String description;
    private Integer price;
    private boolean available;
    private int billingPeriod;
    private List<FeatureValueDTO> features;


    public UUID getPackageId() {
        return packageId;
    }

    public void setPackageId(UUID packageId) {
        this.packageId = packageId;
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

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public int getBillingPeriod() {
        return billingPeriod;
    }

    public void setBillingPeriod(int billingPeriod) {
        this.billingPeriod = billingPeriod;
    }

    public List<FeatureValueDTO> getFeatures() {
        return features;
    }

    public void setFeatures(List<FeatureValueDTO> features) {
        this.features = features;
    }


    @Override
    public String toString() {
        return "PackageFeatureDTO{" +
                "packageId=" + packageId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", price=" + price +
                ", available=" + available +
                ", billingPeriod=" + billingPeriod +
                ", features=" + features +
                '}';
    }
}
