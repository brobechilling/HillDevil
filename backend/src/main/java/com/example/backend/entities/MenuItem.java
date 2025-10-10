package com.example.backend.entities;

import java.math.BigDecimal;
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
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "menu_item")
public class MenuItem {

    @Id
    @Column(name = "menu_item_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID menuItemId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "restaurant_id")
    private Restaurant restaurant;

    // allow menu item to have customization of its category
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // allow menu item to have its own customization
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "menuitem_customization",
        joinColumns = @JoinColumn(name = "menu_item_id"),
        inverseJoinColumns = @JoinColumn(name = "customization_id")
    )
    private Set<Customization> customizations = new LinkedHashSet<>();

    // if yes, it will have customization of the category it belongs to
    @Column(name = "has_customization")
    private boolean hasCustomization;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    private BigDecimal price = BigDecimal.ZERO;

    // soft delete
    @Column(name = "status")
    private boolean status;

    @Column(name = "is_bestseller")
    private boolean isBestSeller;

    @Column(name = "created_at")
    @CreationTimestamp
    private Instant createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private Instant updatedAt;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "menuItem")
    private Set<OrderItem> orderItems = new LinkedHashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "menuItem")
    private Set<BranchMenuItem> branchMenuItems = new LinkedHashSet<>();

    public UUID getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(UUID menuItemId) {
        this.menuItemId = menuItemId;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Set<Customization> getCustomizations() {
        return customizations;
    }

    public void setCustomizations(Set<Customization> customizations) {
        this.customizations = customizations;
    }

    public boolean isHasCustomization() {
        return hasCustomization;
    }

    public void setHasCustomization(boolean hasCustomization) {
        this.hasCustomization = hasCustomization;
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

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public boolean isBestSeller() {
        return isBestSeller;
    }

    public void setBestSeller(boolean isBestSeller) {
        this.isBestSeller = isBestSeller;
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

    public Set<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(Set<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }

    public Set<BranchMenuItem> getBranchMenuItems() {
        return branchMenuItems;
    }

    public void setBranchMenuItems(Set<BranchMenuItem> branchMenuItems) {
        this.branchMenuItems = branchMenuItems;
    }
    
}
