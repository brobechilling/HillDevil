package com.example.backend.entities;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "restaurant")
public class Restaurant {

    @Id
    @Column(name = "restaurant_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID restaurantId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email")
    private String email;

    @Column(name = "status")
    private boolean status;

    @Column(name = "restaurant_phone")
    private String restaurantPhone;

    @Column(name = "created_at")
    @CreationTimestamp
    private Instant createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private Instant updatedAt;
    
    @Column(name = "public_url")
    private String publicUrl;

    @Column(name = "description")
    private String description;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "restaurant")
    private Set<Subscription> subscriptions = new LinkedHashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "restaurant")
    private Set<Category> categories = new LinkedHashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "restaurant")
    private Set<Customization> customizations = new LinkedHashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "restaurant")
    private Set<Branch> branches = new LinkedHashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "restaurant")
    private Set<MenuItem> menuItems = new LinkedHashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "restaurant")
    private Set<RestaurantReport> restaurantReports = new LinkedHashSet<>();

    public UUID getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(UUID restaurantId) {
        this.restaurantId = restaurantId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public String getRestaurantPhone() {
        return restaurantPhone;
    }

    public void setRestaurantPhone(String restaurantPhone) {
        this.restaurantPhone = restaurantPhone;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getPublicUrl() {
        return publicUrl;
    }

    public void setPublicUrl(String publicUrl) {
        this.publicUrl = publicUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Subscription> getSubscriptions() {
        return subscriptions;
    }

    public void setSubscriptions(Set<Subscription> subscriptions) {
        this.subscriptions = subscriptions;
    }

    public Set<Category> getCategories() {
        return categories;
    }

    public void setCategories(Set<Category> categories) {
        this.categories = categories;
    }

    public Set<Customization> getCustomizations() {
        return customizations;
    }

    public void setCustomizations(Set<Customization> customizations) {
        this.customizations = customizations;
    }

    public Set<Branch> getBranches() {
        return branches;
    }

    public void setBranches(Set<Branch> branches) {
        this.branches = branches;
    }

    public Set<MenuItem> getMenuItems() {
        return menuItems;
    }

    public void setMenuItems(Set<MenuItem> menuItems) {
        this.menuItems = menuItems;
    }

    public Set<RestaurantReport> getRestaurantReports() {
        return restaurantReports;
    }

    public void setRestaurantReports(Set<RestaurantReport> restaurantReports) {
        this.restaurantReports = restaurantReports;
    }
    
    
}
